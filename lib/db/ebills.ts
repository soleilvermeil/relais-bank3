import { normalizeIban } from "@/lib/bank-iban";
import { dbAll, dbGet, dbRun, dbTx, type Tx } from "./client";
import { insertPaymentTx, type PaymentInsertInput } from "./transactions";

export const SIL_EMITTER_NAME = "SIL Services Suisse";

/** Demo creditor for seeded scam-style eBill (educational). */
const SIL_CREDITOR = {
  creditor_iban: "CH93 0070 0114 8531 3571 9",
  creditor_bic: null as string | null,
  creditor_name: SIL_EMITTER_NAME,
  creditor_country: "CH",
  creditor_postal_code: "1201",
  creditor_city: "Genève",
  creditor_address1: "Case postale 8099",
  creditor_address2: null as string | null,
  rf_reference: "RF71 1122 3344 5566 7788 9901",
  communication_to_beneficiary: "Réf. client: RB-DEMO-88341",
} as const;

export type EbillEmitterRow = {
  id: number;
  name: string;
  creditor_iban: string;
  creditor_bic: string | null;
  creditor_name: string;
  creditor_country: string;
  creditor_postal_code: string;
  creditor_city: string;
  creditor_address1: string;
  creditor_address2: string | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
};

export type PendingEmitterListItem = {
  emitter_id: number;
  name: string;
  open_bill_count: number;
};

export type OpenEbillListItem = {
  id: number;
  amount_cents: number;
  currency: string;
  due_date: string | null;
  reference_text: string | null;
  accounting_text: string | null;
  created_at: string;
  emitter_id: number;
  emitter_name: string;
};

export type BlockedEmitterListItem = {
  emitter_id: number;
  name: string;
};

export type AcceptedEmitterListItem = {
  emitter_id: number;
  name: string;
  accepted_at: string;
};

export type EbillDetail = {
  id: number;
  user_id: number;
  emitter_id: number;
  amount_cents: number;
  currency: string;
  due_date: string | null;
  reference_text: string | null;
  accounting_text: string | null;
  status: "open" | "paid";
  paid_transaction_id: number | null;
  created_at: string;
  emitter: EbillEmitterRow;
  accepted_at: string | null;
  blocked_at: string | null;
};

function todayIsoLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function addDaysIsoLocal(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const outMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const outDay = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${outMonth}-${outDay}`;
}

/** Upsert global SIL emitter; returns id (for use inside an existing transaction). */
export async function upsertSilDemoEmitter(tx: Tx): Promise<number> {
  return tx.insert(
    `INSERT INTO bank_ebill_emitters (
       name, creditor_iban, creditor_bic, creditor_name, creditor_country,
       creditor_postal_code, creditor_city, creditor_address1, creditor_address2,
       rf_reference, communication_to_beneficiary
     ) VALUES (
       @name, @creditor_iban, @creditor_bic, @creditor_name, @creditor_country,
       @creditor_postal_code, @creditor_city, @creditor_address1, @creditor_address2,
       @rf_reference, @communication_to_beneficiary
     )
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    {
      name: SIL_EMITTER_NAME,
      creditor_iban: SIL_CREDITOR.creditor_iban,
      creditor_bic: SIL_CREDITOR.creditor_bic,
      creditor_name: SIL_CREDITOR.creditor_name,
      creditor_country: SIL_CREDITOR.creditor_country,
      creditor_postal_code: SIL_CREDITOR.creditor_postal_code,
      creditor_city: SIL_CREDITOR.creditor_city,
      creditor_address1: SIL_CREDITOR.creditor_address1,
      creditor_address2: SIL_CREDITOR.creditor_address2,
      rf_reference: SIL_CREDITOR.rf_reference,
      communication_to_beneficiary: SIL_CREDITOR.communication_to_beneficiary,
    },
  );
}

/** Seed pending SIL relationship + one open eBill for a new demo user (call inside `seedUserDemo` tx). */
export async function seedUserSilEbill(tx: Tx, userId: number): Promise<void> {
  const emitterId = await upsertSilDemoEmitter(tx);
  await tx.run(
    `INSERT INTO bank_user_ebill_emitters (user_id, emitter_id, accepted_at, blocked_at)
     VALUES (@userId, @emitterId, NULL, NULL)
     ON CONFLICT (user_id, emitter_id) DO NOTHING`,
    { userId, emitterId },
  );
  const today = todayIsoLocal();
  const dueDate = addDaysIsoLocal(today, 14);
  const amountCents = 249_00;
  await tx.run(
    `INSERT INTO bank_ebills (
       user_id, emitter_id, amount_cents, currency, due_date,
       reference_text, accounting_text, status
     ) VALUES (
       @userId, @emitterId, @amountCents, 'CHF', @dueDate,
       @referenceText, @accountingText, 'open'
     )`,
    {
      userId,
      emitterId,
      amountCents,
      dueDate,
      referenceText: "Facture de services — vérification de compte",
      accountingText: "eBill SIL Services Suisse",
    },
  );
}

export async function listPendingEmittersForUser(userId: number): Promise<PendingEmitterListItem[]> {
  return dbAll<PendingEmitterListItem>(
    `SELECT e.id AS emitter_id, e.name, COUNT(b.id)::int AS open_bill_count
     FROM bank_ebills b
     INNER JOIN bank_ebill_emitters e ON e.id = b.emitter_id
     INNER JOIN bank_user_ebill_emitters u ON u.user_id = b.user_id AND u.emitter_id = b.emitter_id
     WHERE b.user_id = @userId
       AND b.status = 'open'
       AND u.accepted_at IS NULL
       AND u.blocked_at IS NULL
     GROUP BY e.id, e.name
     ORDER BY e.name`,
    { userId },
  );
}

export async function listOpenEbillsActionable(userId: number): Promise<OpenEbillListItem[]> {
  return dbAll<OpenEbillListItem>(
    `SELECT b.id, b.amount_cents, b.currency, b.due_date, b.reference_text, b.accounting_text, b.created_at,
            e.id AS emitter_id, e.name AS emitter_name
     FROM bank_ebills b
     INNER JOIN bank_ebill_emitters e ON e.id = b.emitter_id
     INNER JOIN bank_user_ebill_emitters u ON u.user_id = b.user_id AND u.emitter_id = b.emitter_id
     WHERE b.user_id = @userId
       AND b.status = 'open'
       AND u.accepted_at IS NOT NULL
       AND u.blocked_at IS NULL
     ORDER BY b.due_date NULLS LAST, b.id`,
    { userId },
  );
}

export async function listBlockedEmittersForUser(userId: number): Promise<BlockedEmitterListItem[]> {
  return dbAll<BlockedEmitterListItem>(
    `SELECT e.id AS emitter_id, e.name
     FROM bank_user_ebill_emitters u
     INNER JOIN bank_ebill_emitters e ON e.id = u.emitter_id
     WHERE u.user_id = @userId
       AND u.blocked_at IS NOT NULL
     ORDER BY u.blocked_at DESC, e.name`,
    { userId },
  );
}

/** Billers the user has accepted and not currently blocked. */
export async function listAcceptedEmittersForUser(userId: number): Promise<AcceptedEmitterListItem[]> {
  return dbAll<AcceptedEmitterListItem>(
    `SELECT e.id AS emitter_id, e.name, u.accepted_at
     FROM bank_user_ebill_emitters u
     INNER JOIN bank_ebill_emitters e ON e.id = u.emitter_id
     WHERE u.user_id = @userId
       AND u.accepted_at IS NOT NULL
       AND u.blocked_at IS NULL
     ORDER BY u.accepted_at DESC, e.name`,
    { userId },
  );
}

export async function getEbillDetailForUser(userId: number, ebillId: number): Promise<EbillDetail | null> {
  const row = await dbGet<{
    id: number;
    user_id: number;
    emitter_id: number;
    amount_cents: number;
    currency: string;
    due_date: string | null;
    reference_text: string | null;
    accounting_text: string | null;
    status: string;
    paid_transaction_id: number | null;
    created_at: string;
    accepted_at: string | null;
    blocked_at: string | null;
    emitter_name: string;
    creditor_iban: string;
    creditor_bic: string | null;
    creditor_name: string;
    creditor_country: string;
    creditor_postal_code: string;
    creditor_city: string;
    creditor_address1: string;
    creditor_address2: string | null;
    rf_reference: string | null;
    communication_to_beneficiary: string | null;
  }>(
    `SELECT b.id, b.user_id, b.emitter_id, b.amount_cents, b.currency, b.due_date,
            b.reference_text, b.accounting_text, b.status, b.paid_transaction_id, b.created_at,
            u.accepted_at, u.blocked_at,
            e.name AS emitter_name, e.creditor_iban, e.creditor_bic, e.creditor_name, e.creditor_country,
            e.creditor_postal_code, e.creditor_city, e.creditor_address1, e.creditor_address2,
            e.rf_reference, e.communication_to_beneficiary
     FROM bank_ebills b
     INNER JOIN bank_ebill_emitters e ON e.id = b.emitter_id
     INNER JOIN bank_user_ebill_emitters u ON u.user_id = b.user_id AND u.emitter_id = b.emitter_id
     WHERE b.user_id = @userId AND b.id = @ebillId`,
    { userId, ebillId },
  );
  if (!row) return null;
  if (row.status !== "open" && row.status !== "paid") return null;
  return {
    id: row.id,
    user_id: row.user_id,
    emitter_id: row.emitter_id,
    amount_cents: row.amount_cents,
    currency: row.currency,
    due_date: row.due_date,
    reference_text: row.reference_text,
    accounting_text: row.accounting_text,
    status: row.status as "open" | "paid",
    paid_transaction_id: row.paid_transaction_id,
    created_at: row.created_at,
    accepted_at: row.accepted_at,
    blocked_at: row.blocked_at,
    emitter: {
      id: row.emitter_id,
      name: row.emitter_name,
      creditor_iban: row.creditor_iban,
      creditor_bic: row.creditor_bic,
      creditor_name: row.creditor_name,
      creditor_country: row.creditor_country,
      creditor_postal_code: row.creditor_postal_code,
      creditor_city: row.creditor_city,
      creditor_address1: row.creditor_address1,
      creditor_address2: row.creditor_address2,
      rf_reference: row.rf_reference,
      communication_to_beneficiary: row.communication_to_beneficiary,
    },
  };
}

export async function acceptEmitterForUser(userId: number, emitterId: number): Promise<boolean> {
  const row = await dbGet<{ accepted_at: string }>(
    `UPDATE bank_user_ebill_emitters
     SET accepted_at = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
     WHERE user_id = @userId AND emitter_id = @emitterId AND accepted_at IS NULL AND blocked_at IS NULL
     RETURNING accepted_at`,
    { userId, emitterId },
  );
  return row != null;
}

export async function blockEmitterForUser(userId: number, emitterId: number): Promise<boolean> {
  const row = await dbGet<{ blocked_at: string }>(
    `UPDATE bank_user_ebill_emitters
     SET blocked_at = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
     WHERE user_id = @userId AND emitter_id = @emitterId AND blocked_at IS NULL
     RETURNING blocked_at`,
    { userId, emitterId },
  );
  return row != null;
}

export async function unblockEmitterForUser(userId: number, emitterId: number): Promise<void> {
  await dbRun(
    `UPDATE bank_user_ebill_emitters SET blocked_at = NULL
     WHERE user_id = @userId AND emitter_id = @emitterId AND blocked_at IS NOT NULL`,
    { userId, emitterId },
  );
}

type ApproveEbillRow = {
  amount_cents: number;
  accounting_text: string | null;
  accepted_at: string | null;
  blocked_at: string | null;
  status: string;
  creditor_iban: string;
  creditor_bic: string | null;
  creditor_name: string;
  creditor_country: string;
  creditor_postal_code: string;
  creditor_city: string;
  creditor_address1: string;
  creditor_address2: string | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
};

export async function approveEbillForUser(
  userId: number,
  ebillId: number,
  debitAccountId: number,
): Promise<{ transactionId: number }> {
  return dbTx(async (tx) => {
    const acc = await tx.get<{ id: number }>(
      `SELECT id FROM bank_accounts
       WHERE id = @debitAccountId AND user_id = @userId AND category IN ('checking', 'savings')`,
      { debitAccountId, userId },
    );
    if (!acc) {
      throw new Error("Invalid debit account");
    }

    const bill = await tx.get<ApproveEbillRow>(
      `SELECT b.amount_cents, b.accounting_text, b.status,
              u.accepted_at, u.blocked_at,
              e.creditor_iban, e.creditor_bic, e.creditor_name, e.creditor_country,
              e.creditor_postal_code, e.creditor_city, e.creditor_address1, e.creditor_address2,
              e.rf_reference, e.communication_to_beneficiary
       FROM bank_ebills b
       INNER JOIN bank_ebill_emitters e ON e.id = b.emitter_id
       INNER JOIN bank_user_ebill_emitters u ON u.user_id = b.user_id AND u.emitter_id = b.emitter_id
       WHERE b.user_id = @userId AND b.id = @ebillId`,
      { userId, ebillId },
    );
    if (!bill || bill.status !== "open") {
      throw new Error("eBill not found or already paid");
    }
    if (bill.accepted_at == null || bill.blocked_at != null) {
      throw new Error("Emitter must be accepted and not blocked");
    }

    const paymentInput: PaymentInsertInput = {
      user_id: userId,
      debit_account_id: debitAccountId,
      amount_cents: -Math.abs(bill.amount_cents),
      execution_date: todayIsoLocal(),
      accounting_text: bill.accounting_text,
      beneficiary_iban: normalizeIban(bill.creditor_iban) || bill.creditor_iban,
      beneficiary_bic: bill.creditor_bic,
      beneficiary_name: bill.creditor_name,
      beneficiary_country: bill.creditor_country,
      beneficiary_postal_code: bill.creditor_postal_code,
      beneficiary_city: bill.creditor_city,
      beneficiary_address1: bill.creditor_address1,
      beneficiary_address2: bill.creditor_address2,
      payment_type: "oneTime",
      first_execution_date: null,
      frequency: null,
      weekend_holiday_rule: null,
      period_type: null,
      end_date: null,
      is_express: true,
      rf_reference: bill.rf_reference,
      communication_to_beneficiary: bill.communication_to_beneficiary,
      debtor_name: null,
      debtor_country: null,
      debtor_postal_code: null,
      debtor_city: null,
      debtor_address1: null,
      debtor_address2: null,
    };

    const transactionId = await insertPaymentTx(tx, paymentInput);

    const updated = await tx.get<{ id: number }>(
      `UPDATE bank_ebills
       SET status = 'paid', paid_transaction_id = @transactionId
       WHERE id = @ebillId AND user_id = @userId AND status = 'open'
       RETURNING id`,
      { transactionId, ebillId, userId },
    );
    if (!updated) {
      throw new Error("eBill could not be marked paid");
    }

    return { transactionId };
  });
}
