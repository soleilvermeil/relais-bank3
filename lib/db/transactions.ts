import { normalizeIban } from "@/lib/bank-iban";
import { dbAll, dbGet, dbInsert, dbRun, type Tx } from "./client";

export type TransactionKind =
  | "payment"
  | "transfer"
  | "purchaseService"
  | "credit"
  | "debit";

export type TransactionRow = {
  id: number;
  user_id: number;
  kind: TransactionKind;
  created_at: string;
  debit_account_id: number | null;
  credit_account_id: number | null;
  amount_cents: number;
  currency: string;
  execution_date: string | null;
  accounting_text: string | null;

  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  payment_type: string | null;
  first_execution_date: string | null;
  frequency: string | null;
  weekend_holiday_rule: string | null;
  period_type: string | null;
  end_date: string | null;
  is_express: number | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;

  execution_mode: string | null;
  is_conditionally_visible: number;

  counterparty_name: string | null;
  counterparty_iban: string | null;
};

export type Transaction = Omit<TransactionRow, "id" | "amount_cents" | "is_express" | "is_conditionally_visible"> & {
  id: number | string;
  amount: number;
  is_express: boolean | null;
  is_conditionally_visible: boolean;
};

export type StandingOrderFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export type StandingOrderRow = {
  id: number;
  user_id: number;
  created_at: string;
  debit_account_id: number;
  amount_cents: number;
  currency: string;
  start_date: string;
  end_date: string | null;
  frequency: StandingOrderFrequency;
  weekend_holiday_rule: string;
  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  accounting_text: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;
  is_active: number;
  is_cancelled: number;
};

export type StandingOrderOccurrenceDetail = {
  syntheticId: string;
  execution_date: string;
  standingOrder: StandingOrderRow;
};

const STANDING_ORDER_SYNTHETIC_PREFIX = "so";
const UPCOMING_STANDING_HORIZON_DAYS = 365;

/** Synthetic id for incoming credit from another user's one-time payment (`inc:123`). */
export const INCOMING_PAYMENT_SYNTHETIC_PREFIX = "inc";
/** Synthetic id for incoming credit from another user's standing order (`inc-so:7:2026-04-25`). */
export const INCOMING_STANDING_SYNTHETIC_PREFIX = "inc-so";

export function formatIncomingPaymentSyntheticId(transactionId: number): string {
  return `${INCOMING_PAYMENT_SYNTHETIC_PREFIX}:${transactionId}`;
}

export function formatIncomingStandingSyntheticId(
  standingOrderId: number,
  executionDate: string,
): string {
  return `${INCOMING_STANDING_SYNTHETIC_PREFIX}:${standingOrderId}:${executionDate}`;
}

export function parseIncomingPaymentSyntheticId(value: string): number | null {
  const parts = value.split(":");
  if (parts.length !== 2 || parts[0] !== INCOMING_PAYMENT_SYNTHETIC_PREFIX) return null;
  const id = Number(parts[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function parseIncomingStandingSyntheticId(
  value: string,
): { standingOrderId: number; executionDate: string } | null {
  const prefix = `${INCOMING_STANDING_SYNTHETIC_PREFIX}:`;
  if (!value.startsWith(prefix)) return null;
  const rest = value.slice(prefix.length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon <= 0) return null;
  const executionDate = rest.slice(lastColon + 1);
  const idRaw = rest.slice(0, lastColon);
  const standingOrderId = Number(idRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(executionDate)) return null;
  return { standingOrderId, executionDate };
}

function todayIsoLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const outMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const outDay = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${outMonth}-${outDay}`;
}

function lastDayOfMonthUtc(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonthsClampedIso(iso: string, months: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const baseMonthIndex = month - 1;
  const totalMonths = baseMonthIndex + months;
  const targetYear = year + Math.floor(totalMonths / 12);
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12;
  const targetDay = Math.min(day, lastDayOfMonthUtc(targetYear, targetMonthIndex));
  const outMonth = String(targetMonthIndex + 1).padStart(2, "0");
  const outDay = String(targetDay).padStart(2, "0");
  return `${targetYear}-${outMonth}-${outDay}`;
}

function adjustWeekendRule(iso: string, rule: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  if (weekday === 6) {
    date.setUTCDate(date.getUTCDate() + (rule === "before" ? -1 : 2));
  } else if (weekday === 0) {
    date.setUTCDate(date.getUTCDate() + (rule === "before" ? -2 : 1));
  }
  const outMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const outDay = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${outMonth}-${outDay}`;
}

function nextFrequencyDate(iso: string, frequency: StandingOrderFrequency): string {
  if (frequency === "weekly") return addDaysIso(iso, 7);
  if (frequency === "monthly") return addMonthsClampedIso(iso, 1);
  if (frequency === "quarterly") return addMonthsClampedIso(iso, 3);
  return addMonthsClampedIso(iso, 12);
}

function syntheticStandingOrderId(standingOrderId: number, executionDate: string): string {
  return `${STANDING_ORDER_SYNTHETIC_PREFIX}:${standingOrderId}:${executionDate}`;
}

function parseSyntheticStandingOrderId(value: string): { standingOrderId: number; executionDate: string } | null {
  const [prefix, idRaw, executionDate, ...rest] = value.split(":");
  if (rest.length > 0 || prefix !== STANDING_ORDER_SYNTHETIC_PREFIX) return null;
  const standingOrderId = Number(idRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(executionDate)) return null;
  return { standingOrderId, executionDate };
}

async function listStandingOrdersForAccount(accountId: number, userId: number): Promise<StandingOrderRow[]> {
  return dbAll<StandingOrderRow>(
    `SELECT * FROM standing_orders
     WHERE debit_account_id = @id AND user_id = @userId AND (is_active = 1 OR is_cancelled = 1)
     ORDER BY id ASC`,
    { id: accountId, userId },
  );
}

async function listAllStandingOrders(userId: number): Promise<StandingOrderRow[]> {
  return dbAll<StandingOrderRow>(
    `SELECT * FROM standing_orders
     WHERE user_id = @userId AND (is_active = 1 OR is_cancelled = 1)
     ORDER BY id ASC`,
    { userId },
  );
}

function listStandingExecutionDates(order: StandingOrderRow, fromIso: string, toIso: string): string[] {
  const out: string[] = [];
  let raw = order.start_date;
  let guard = 0;
  while (guard < 5000) {
    guard += 1;
    const execution = adjustWeekendRule(raw, order.weekend_holiday_rule);
    if (execution > toIso && raw > toIso) break;
    if (
      execution >= fromIso &&
      execution <= toIso &&
      (order.end_date == null || execution <= order.end_date)
    ) {
      out.push(execution);
    }
    if (order.end_date != null && raw > order.end_date) break;
    raw = nextFrequencyDate(raw, order.frequency);
  }
  return out;
}

function standingOrderOccurrenceToTransaction(
  order: StandingOrderRow,
  accountId: number,
  executionDate: string,
): Transaction {
  const rowLike: TransactionRow = {
    id: order.id,
    user_id: order.user_id,
    kind: "payment",
    created_at: order.created_at,
    debit_account_id: order.debit_account_id,
    credit_account_id: null,
    amount_cents: order.amount_cents,
    currency: order.currency,
    execution_date: executionDate,
    accounting_text: order.accounting_text,
    beneficiary_iban: order.beneficiary_iban,
    beneficiary_bic: order.beneficiary_bic,
    beneficiary_name: order.beneficiary_name,
    beneficiary_country: order.beneficiary_country,
    beneficiary_postal_code: order.beneficiary_postal_code,
    beneficiary_city: order.beneficiary_city,
    beneficiary_address1: order.beneficiary_address1,
    beneficiary_address2: order.beneficiary_address2,
    payment_type: "standing",
    first_execution_date: order.start_date,
    frequency: order.frequency,
    weekend_holiday_rule: order.weekend_holiday_rule,
    period_type: order.end_date == null ? "unlimited" : "endDate",
    end_date: order.end_date,
    is_express: 0,
    rf_reference: order.rf_reference,
    communication_to_beneficiary: order.communication_to_beneficiary,
    debtor_name: order.debtor_name,
    debtor_country: order.debtor_country,
    debtor_postal_code: order.debtor_postal_code,
    debtor_city: order.debtor_city,
    debtor_address1: order.debtor_address1,
    debtor_address2: order.debtor_address2,
    execution_mode: null,
    is_conditionally_visible: 0,
    counterparty_name: null,
    counterparty_iban: null,
  };
  return {
    ...rowToTransaction(rowLike, accountId),
    id: syntheticStandingOrderId(order.id, executionDate),
  };
}

function rowToTransaction(row: TransactionRow, accountId: number): Transaction {
  const { amount_cents, is_express, is_conditionally_visible, ...rest } = row;
  const amountForAccount =
    row.kind === "transfer" && row.credit_account_id === accountId
      ? Math.abs(amount_cents)
      : amount_cents;
  return {
    ...rest,
    amount: amountForAccount / 100,
    is_express:
      is_express === null ? null : is_express === 1,
    is_conditionally_visible: is_conditionally_visible === 1,
  };
}

export async function listIncomingPaymentsForIban(
  iban: string,
  recipientUserId: number,
  today: string,
): Promise<TransactionRow[]> {
  const normalized = normalizeIban(iban);
  if (normalized === "") return [];
  return dbAll<TransactionRow>(
    `SELECT * FROM transactions
     WHERE kind = 'payment'
       AND COALESCE(payment_type, 'oneTime') != 'standing'
       AND user_id != @recipientUserId
       AND beneficiary_iban IS NOT NULL
       AND execution_date IS NOT NULL
       AND execution_date <= @today
       AND UPPER(REPLACE(beneficiary_iban, ' ', '')) = @iban`,
    { recipientUserId, today, iban: normalized },
  );
}

export async function listIncomingStandingOrdersForIban(
  iban: string,
  recipientUserId: number,
): Promise<StandingOrderRow[]> {
  const normalized = normalizeIban(iban);
  if (normalized === "") return [];
  return dbAll<StandingOrderRow>(
    `SELECT * FROM standing_orders
     WHERE user_id != @recipientUserId
       AND beneficiary_iban IS NOT NULL
       AND (is_active = 1 OR is_cancelled = 1)
       AND UPPER(REPLACE(beneficiary_iban, ' ', '')) = @iban`,
    { recipientUserId, iban: normalized },
  );
}

function incomingForeignPaymentToCreditTransaction(
  tx: TransactionRow,
  recipientAccountId: number,
  recipientUserId: number,
): Transaction {
  const synthetic: TransactionRow = {
    ...tx,
    user_id: recipientUserId,
    kind: "credit",
    debit_account_id: null,
    credit_account_id: recipientAccountId,
    amount_cents: Math.abs(tx.amount_cents),
    payment_type: null,
    first_execution_date: null,
    frequency: null,
    weekend_holiday_rule: null,
    period_type: null,
    end_date: null,
    is_conditionally_visible: 0,
    counterparty_name: tx.debtor_name,
    counterparty_iban: null,
  };
  const base = rowToTransaction(synthetic, recipientAccountId);
  return {
    ...base,
    id: formatIncomingPaymentSyntheticId(tx.id),
  };
}

function incomingForeignStandingOccurrenceToCreditTransaction(
  order: StandingOrderRow,
  executionDate: string,
  recipientAccountId: number,
  recipientUserId: number,
): Transaction {
  const synthetic: TransactionRow = {
    id: order.id,
    user_id: recipientUserId,
    kind: "credit",
    created_at: order.created_at,
    debit_account_id: null,
    credit_account_id: recipientAccountId,
    amount_cents: Math.abs(order.amount_cents),
    currency: order.currency,
    execution_date: executionDate,
    accounting_text: order.accounting_text,
    beneficiary_iban: null,
    beneficiary_bic: null,
    beneficiary_name: null,
    beneficiary_country: null,
    beneficiary_postal_code: null,
    beneficiary_city: null,
    beneficiary_address1: null,
    beneficiary_address2: null,
    payment_type: null,
    first_execution_date: null,
    frequency: null,
    weekend_holiday_rule: null,
    period_type: null,
    end_date: null,
    is_express: null,
    rf_reference: order.rf_reference,
    communication_to_beneficiary: null,
    debtor_name: order.debtor_name,
    debtor_country: order.debtor_country,
    debtor_postal_code: order.debtor_postal_code,
    debtor_city: order.debtor_city,
    debtor_address1: order.debtor_address1,
    debtor_address2: order.debtor_address2,
    execution_mode: null,
    is_conditionally_visible: 0,
    counterparty_name: order.debtor_name,
    counterparty_iban: null,
  };
  const base = rowToTransaction(synthetic, recipientAccountId);
  return {
    ...base,
    id: formatIncomingStandingSyntheticId(order.id, executionDate),
  };
}

async function sumIncomingOneTimeCreditsCents(
  identifier: string,
  recipientUserId: number,
  today: string,
): Promise<number> {
  const normalized = normalizeIban(identifier);
  if (normalized === "") return 0;
  const row = await dbGet<{ s: string | number | null }>(
    `SELECT COALESCE(SUM(ABS(amount_cents)), 0) AS s
     FROM transactions
     WHERE kind = 'payment'
       AND COALESCE(payment_type, 'oneTime') != 'standing'
       AND user_id != @recipientUserId
       AND beneficiary_iban IS NOT NULL
       AND execution_date IS NOT NULL
       AND execution_date <= @today
       AND UPPER(REPLACE(beneficiary_iban, ' ', '')) = @iban`,
    { recipientUserId, today, iban: normalized },
  );
  return Number(row?.s ?? 0);
}

async function sumIncomingStandingCreditsCents(
  identifier: string,
  recipientUserId: number,
  today: string,
): Promise<number> {
  const orders = await listIncomingStandingOrdersForIban(identifier, recipientUserId);
  let sum = 0;
  for (const order of orders) {
    const dates = listStandingExecutionDates(order, order.start_date, today);
    sum += dates.length * Math.abs(order.amount_cents);
  }
  return sum;
}

export async function listTransactionsForAccount(accountId: number, userId: number): Promise<Transaction[]> {
  const accountMeta = await dbGet<{ identifier: string }>(
    `SELECT identifier FROM accounts WHERE id = @id AND user_id = @userId`,
    { id: accountId, userId },
  );
  if (!accountMeta) {
    return [];
  }

  const today = todayIsoLocal();
  const horizon = addDaysIso(today, UPCOMING_STANDING_HORIZON_DAYS);
  const rows = await dbAll<TransactionRow>(
    `SELECT * FROM transactions
     WHERE user_id = @userId
       AND (debit_account_id = @id OR credit_account_id = @id)
       AND (
         is_conditionally_visible = 0
         OR (is_conditionally_visible = 1 AND execution_date <= @today)
       )
     ORDER BY execution_date DESC, id DESC`,
    { id: accountId, userId, today },
  );
  const persisted = rows.map((row) => rowToTransaction(row, accountId));
  const standingOrders = await listStandingOrdersForAccount(accountId, userId);
  const standingOccurrences = standingOrders.flatMap((order) =>
    listStandingExecutionDates(order, order.start_date, horizon).map((executionDate) =>
      standingOrderOccurrenceToTransaction(order, accountId, executionDate),
    ),
  );

  const incomingRows = await listIncomingPaymentsForIban(accountMeta.identifier, userId, today);
  const foreignPayments = incomingRows.map((txRow) =>
    incomingForeignPaymentToCreditTransaction(txRow, accountId, userId),
  );

  const foreignStandingOrders = await listIncomingStandingOrdersForIban(accountMeta.identifier, userId);
  const foreignStandingCredits = foreignStandingOrders.flatMap((order) =>
    listStandingExecutionDates(order, order.start_date, today).map((executionDate) =>
      incomingForeignStandingOccurrenceToCreditTransaction(order, executionDate, accountId, userId),
    ),
  );

  const merged = [...persisted, ...standingOccurrences, ...foreignPayments, ...foreignStandingCredits];
  merged.sort((a, b) => {
    const dateA = a.execution_date ?? "";
    const dateB = b.execution_date ?? "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return String(b.id).localeCompare(String(a.id));
  });
  return merged;
}

export async function getTransactionById(id: number, userId: number): Promise<TransactionRow | null> {
  const row = await dbGet<TransactionRow>(
    `SELECT * FROM transactions WHERE id = @id AND user_id = @userId`,
    { id, userId },
  );
  return row ?? null;
}

/** Foreign user's payment whose beneficiary IBAN matches one of this user's accounts (incoming credit). */
export async function getIncomingPaymentForUser(
  transactionId: number,
  recipientUserId: number,
): Promise<TransactionRow | null> {
  const today = todayIsoLocal();
  const row = await dbGet<TransactionRow>(
    `SELECT t.* FROM transactions t
     WHERE t.id = @transactionId
       AND t.kind = 'payment'
       AND COALESCE(t.payment_type, 'oneTime') != 'standing'
       AND t.execution_date IS NOT NULL
       AND t.execution_date <= @today
       AND t.user_id != @recipientUserId
       AND t.beneficiary_iban IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM accounts a
         WHERE a.user_id = @recipientUserId
           AND UPPER(REPLACE(a.identifier, ' ', '')) = UPPER(REPLACE(t.beneficiary_iban, ' ', ''))
       )`,
    { transactionId, today, recipientUserId },
  );
  return row ?? null;
}

/** Foreign standing-order occurrence credited to this user's matching IBAN. */
export async function getIncomingStandingOccurrenceForRecipient(
  standingOrderId: number,
  executionDate: string,
  recipientUserId: number,
): Promise<StandingOrderOccurrenceDetail | null> {
  const today = todayIsoLocal();
  if (executionDate > today) return null;

  const order = await dbGet<StandingOrderRow>(
    `SELECT * FROM standing_orders
     WHERE id = @standingOrderId
       AND user_id != @recipientUserId
       AND beneficiary_iban IS NOT NULL`,
    { standingOrderId, recipientUserId },
  );
  if (!order) return null;

  const ok = await dbGet<{ ok: number }>(
    `SELECT 1 AS ok FROM accounts a
     WHERE a.user_id = @recipientUserId
       AND UPPER(REPLACE(a.identifier, ' ', '')) = UPPER(REPLACE(@beneficiaryIban, ' ', ''))
     LIMIT 1`,
    {
      recipientUserId,
      beneficiaryIban: order.beneficiary_iban ?? "",
    },
  );
  if (!ok) return null;

  const executedDates = listStandingExecutionDates(order, order.start_date, executionDate);
  if (!executedDates.includes(executionDate)) return null;

  return {
    syntheticId: formatIncomingStandingSyntheticId(standingOrderId, executionDate),
    execution_date: executionDate,
    standingOrder: order,
  };
}

/** Transaction row for detail UI when viewing an incoming one-time payment as beneficiary. */
export function foreignPaymentToRecipientCreditDetailRow(tx: TransactionRow): TransactionRow {
  return {
    ...tx,
    kind: "credit",
    amount_cents: Math.abs(tx.amount_cents),
    debit_account_id: null,
    credit_account_id: null,
    payment_type: null,
    is_conditionally_visible: 0,
    counterparty_name: tx.debtor_name,
    counterparty_iban: null,
  };
}

/** Transaction row for detail UI when viewing an incoming standing occurrence as beneficiary. */
export function foreignStandingOccurrenceToRecipientCreditDetailRow(
  occurrence: StandingOrderOccurrenceDetail,
): TransactionRow {
  const order = occurrence.standingOrder;
  return {
    id: order.id,
    user_id: order.user_id,
    kind: "credit",
    created_at: order.created_at,
    debit_account_id: null,
    credit_account_id: null,
    amount_cents: Math.abs(order.amount_cents),
    currency: order.currency,
    execution_date: occurrence.execution_date,
    accounting_text: order.accounting_text,
    beneficiary_iban: null,
    beneficiary_bic: null,
    beneficiary_name: null,
    beneficiary_country: null,
    beneficiary_postal_code: null,
    beneficiary_city: null,
    beneficiary_address1: null,
    beneficiary_address2: null,
    payment_type: null,
    first_execution_date: null,
    frequency: null,
    weekend_holiday_rule: null,
    period_type: null,
    end_date: null,
    is_express: null,
    rf_reference: order.rf_reference,
    communication_to_beneficiary: null,
    debtor_name: order.debtor_name,
    debtor_country: order.debtor_country,
    debtor_postal_code: order.debtor_postal_code,
    debtor_city: order.debtor_city,
    debtor_address1: order.debtor_address1,
    debtor_address2: order.debtor_address2,
    execution_mode: null,
    is_conditionally_visible: 0,
    counterparty_name: order.debtor_name,
    counterparty_iban: null,
  };
}

/** Net CHF cents for an account: debits use stored amount; transfers credit the other leg with -amount. */
export async function computeBalanceCentsForAccount(accountId: number, userId: number): Promise<number> {
  const today = todayIsoLocal();
  const row = await dbGet<{ balance_cents: string | number | null }>(
    `SELECT
       COALESCE((
         SELECT SUM(amount_cents)
         FROM transactions
         WHERE user_id = @userId
           AND debit_account_id = @id
           AND (
             is_conditionally_visible = 0
             OR (is_conditionally_visible = 1 AND execution_date <= @today)
           )
       ), 0)
       + COALESCE(
         (
           SELECT SUM(-amount_cents)
           FROM transactions
           WHERE user_id = @userId
             AND credit_account_id = @id
             AND kind = 'transfer'
             AND (
               is_conditionally_visible = 0
               OR (is_conditionally_visible = 1 AND execution_date <= @today)
             )
         ),
         0
       ) AS balance_cents`,
    { id: accountId, userId, today },
  );
  const base = Number(row?.balance_cents ?? 0);
  const standingOrders = await listStandingOrdersForAccount(accountId, userId);
  let standingCents = 0;
  for (const order of standingOrders) {
    standingCents += listStandingExecutionDates(order, order.start_date, today).length * order.amount_cents;
  }

  const accountMeta = await dbGet<{ identifier: string }>(
    `SELECT identifier FROM accounts WHERE id = @id AND user_id = @userId`,
    { id: accountId, userId },
  );
  if (!accountMeta) {
    return base + standingCents;
  }

  const incomingOneTime = await sumIncomingOneTimeCreditsCents(accountMeta.identifier, userId, today);
  const incomingStanding = await sumIncomingStandingCreditsCents(accountMeta.identifier, userId, today);

  return base + standingCents + incomingOneTime + incomingStanding;
}

/** One round-trip: map account id -> net balance in cents from all transactions. */
export async function computeBalanceCentsByAccountId(userId: number): Promise<Map<number, number>> {
  const today = todayIsoLocal();
  const rows = await dbAll<{ account_id: number; balance_cents: string | number | null }>(
    `SELECT a.id AS account_id,
       COALESCE(d.debit_sum, 0) + COALESCE(c.credit_transfer_sum, 0) AS balance_cents
     FROM accounts a
     LEFT JOIN (
       SELECT debit_account_id AS id, SUM(amount_cents) AS debit_sum
       FROM transactions
       WHERE user_id = @userId
         AND debit_account_id IS NOT NULL
         AND (
           is_conditionally_visible = 0
           OR (is_conditionally_visible = 1 AND execution_date <= @today)
         )
       GROUP BY debit_account_id
     ) d ON d.id = a.id
     LEFT JOIN (
       SELECT credit_account_id AS id, SUM(-amount_cents) AS credit_transfer_sum
       FROM transactions
       WHERE user_id = @userId
         AND credit_account_id IS NOT NULL
         AND kind = 'transfer'
         AND (
           is_conditionally_visible = 0
           OR (is_conditionally_visible = 1 AND execution_date <= @today)
         )
       GROUP BY credit_account_id
     ) c ON c.id = a.id
     WHERE a.user_id = @userId`,
    { userId, today },
  );

  const map = new Map<number, number>();
  for (const r of rows) {
    map.set(r.account_id, Number(r.balance_cents ?? 0));
  }
  const standingOrders = await listAllStandingOrders(userId);
  for (const order of standingOrders) {
    const occurrenceCount = listStandingExecutionDates(order, order.start_date, today).length;
    if (occurrenceCount === 0) continue;
    const current = map.get(order.debit_account_id) ?? 0;
    map.set(order.debit_account_id, current + occurrenceCount * order.amount_cents);
  }

  const accounts = await dbAll<{ id: number; identifier: string }>(
    `SELECT id, identifier FROM accounts WHERE user_id = @userId`,
    { userId },
  );

  for (const acc of accounts) {
    const incomingOneTime = await sumIncomingOneTimeCreditsCents(acc.identifier, userId, today);
    const incomingStanding = await sumIncomingStandingCreditsCents(acc.identifier, userId, today);
    const extra = incomingOneTime + incomingStanding;
    if (extra === 0) continue;
    const current = map.get(acc.id) ?? 0;
    map.set(acc.id, current + extra);
  }

  return map;
}

export type PaymentInsertInput = {
  user_id: number;
  debit_account_id: number;
  amount_cents: number;
  execution_date: string | null;
  accounting_text: string | null;
  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  payment_type: "oneTime" | "standing" | null;
  first_execution_date: string | null;
  frequency: string | null;
  weekend_holiday_rule: string | null;
  period_type: string | null;
  end_date: string | null;
  is_express: boolean;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;
};

const INSERT_PAYMENT_SQL = `INSERT INTO transactions (
       user_id, kind, debit_account_id, amount_cents, currency,
       execution_date, accounting_text,
       beneficiary_iban, beneficiary_bic, beneficiary_name, beneficiary_country,
       beneficiary_postal_code, beneficiary_city,
       beneficiary_address1, beneficiary_address2,
       payment_type, first_execution_date, frequency,
       weekend_holiday_rule, period_type, end_date,
       is_express, rf_reference, communication_to_beneficiary,
       debtor_name, debtor_country, debtor_postal_code, is_conditionally_visible,
       debtor_city, debtor_address1, debtor_address2
     ) VALUES (
       @user_id, 'payment', @debit_account_id, @amount_cents, 'CHF',
       @execution_date, @accounting_text,
       @beneficiary_iban, @beneficiary_bic, @beneficiary_name, @beneficiary_country,
       @beneficiary_postal_code, @beneficiary_city,
       @beneficiary_address1, @beneficiary_address2,
       @payment_type, @first_execution_date, @frequency,
       @weekend_holiday_rule, @period_type, @end_date,
       @is_express, @rf_reference, @communication_to_beneficiary,
       @debtor_name, @debtor_country, @debtor_postal_code, 0,
       @debtor_city, @debtor_address1, @debtor_address2
     ) RETURNING id`;

function paymentInsertParams(input: PaymentInsertInput): Record<string, unknown> {
  return {
    ...input,
    is_express: input.is_express ? 1 : 0,
  };
}

export async function insertPaymentTx(tx: Tx, input: PaymentInsertInput): Promise<number> {
  return tx.insert(INSERT_PAYMENT_SQL, paymentInsertParams(input));
}

export async function insertPayment(input: PaymentInsertInput): Promise<number> {
  return dbInsert(INSERT_PAYMENT_SQL, paymentInsertParams(input));
}

export type StandingOrderInsertInput = {
  user_id: number;
  debit_account_id: number;
  amount_cents: number;
  start_date: string;
  end_date: string | null;
  frequency: StandingOrderFrequency;
  weekend_holiday_rule: string;
  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  accounting_text: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;
};

export async function insertStandingOrder(input: StandingOrderInsertInput): Promise<number> {
  return dbInsert(
    `INSERT INTO standing_orders (
       user_id, debit_account_id, amount_cents, currency,
       start_date, end_date, frequency, weekend_holiday_rule,
       beneficiary_iban, beneficiary_bic, beneficiary_name, beneficiary_country,
       beneficiary_postal_code, beneficiary_city,
       beneficiary_address1, beneficiary_address2,
       rf_reference, communication_to_beneficiary, accounting_text,
       debtor_name, debtor_country, debtor_postal_code,
       debtor_city, debtor_address1, debtor_address2, is_active, is_cancelled
     ) VALUES (
       @user_id, @debit_account_id, @amount_cents, 'CHF',
       @start_date, @end_date, @frequency, @weekend_holiday_rule,
       @beneficiary_iban, @beneficiary_bic, @beneficiary_name, @beneficiary_country,
       @beneficiary_postal_code, @beneficiary_city,
       @beneficiary_address1, @beneficiary_address2,
       @rf_reference, @communication_to_beneficiary, @accounting_text,
       @debtor_name, @debtor_country, @debtor_postal_code,
       @debtor_city, @debtor_address1, @debtor_address2, 1, 0
     ) RETURNING id`,
    input,
  );
}

export async function pauseStandingOrder(id: number, userId: number): Promise<void> {
  await dbRun(
    `UPDATE standing_orders
     SET is_active = 0
     WHERE id = @id AND user_id = @userId`,
    { id, userId },
  );
}

export async function deleteStandingOrder(id: number, userId: number): Promise<void> {
  const today = todayIsoLocal();
  await dbRun(
    `UPDATE standing_orders
     SET
       end_date = CASE
         WHEN end_date IS NULL OR end_date > @today THEN @today
         ELSE end_date
       END,
       is_active = 0,
       is_cancelled = 1
     WHERE id = @id AND user_id = @userId`,
    { id, userId, today },
  );
}

export async function deleteFuturePendingOrderTransaction(id: number, userId: number): Promise<void> {
  const today = todayIsoLocal();
  await dbRun(
    `DELETE FROM transactions
     WHERE id = @id AND user_id = @userId
       AND execution_date > @today
       AND (
         kind = 'transfer'
         OR (kind = 'payment' AND COALESCE(payment_type, 'oneTime') != 'standing')
       )`,
    { id, userId, today },
  );
}

export type TransferInsertInput = {
  user_id: number;
  debit_account_id: number;
  credit_account_id: number;
  amount_cents: number;
  execution_mode: "immediate" | "date";
  execution_date: string | null;
  accounting_text: string | null;
};

export async function insertTransfer(input: TransferInsertInput): Promise<number> {
  return dbInsert(
    `INSERT INTO transactions (
       user_id, kind, debit_account_id, credit_account_id, amount_cents, currency,
       execution_mode, execution_date, accounting_text, is_conditionally_visible
     ) VALUES (
       @user_id, 'transfer', @debit_account_id, @credit_account_id, @amount_cents, 'CHF',
       @execution_mode, @execution_date, @accounting_text, 0
     ) RETURNING id`,
    input,
  );
}

export async function getStandingOrderOccurrenceBySyntheticId(
  syntheticId: string,
  userId: number,
): Promise<StandingOrderOccurrenceDetail | null> {
  const parsed = parseSyntheticStandingOrderId(syntheticId);
  if (!parsed) return null;
  const standingOrder = await dbGet<StandingOrderRow>(
    `SELECT * FROM standing_orders WHERE id = @id AND user_id = @userId`,
    { id: parsed.standingOrderId, userId },
  );
  if (!standingOrder) return null;
  const matches = listStandingExecutionDates(
    standingOrder,
    parsed.executionDate,
    parsed.executionDate,
  );
  if (matches.length === 0) return null;
  return {
    syntheticId,
    execution_date: parsed.executionDate,
    standingOrder,
  };
}

/** `so:{standingOrderId}` only — not an occurrence (`so:id:date`). */
export function parseStandingOrderSummarySoId(value: string): number | null {
  const parts = value.split(":");
  if (parts.length !== 2) return null;
  const [prefix, idRaw] = parts;
  if (prefix !== STANDING_ORDER_SYNTHETIC_PREFIX) return null;
  const standingOrderId = Number(idRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) return null;
  return standingOrderId;
}

export async function getStandingOrderById(id: number, userId: number): Promise<StandingOrderRow | null> {
  const row = await dbGet<StandingOrderRow>(
    `SELECT * FROM standing_orders WHERE id = @id AND user_id = @userId`,
    { id, userId },
  );
  return row ?? null;
}

/** Next execution in the standing-horizon window, or last past execution, or `start_date`. */
export function nextStandingExecutionForSummary(order: StandingOrderRow): string {
  const today = todayIsoLocal();
  const horizon = addDaysIso(today, UPCOMING_STANDING_HORIZON_DAYS);
  const futureDates = listStandingExecutionDates(order, today, horizon);
  if (futureDates.length > 0) return futureDates[0]!;
  const pastDates = listStandingExecutionDates(order, order.start_date, today);
  if (pastDates.length > 0) return pastDates[pastDates.length - 1]!;
  return order.start_date;
}

/** Whether the schedule still has at least one execution strictly after today. */
export function standingOrderHasFutureExecution(order: StandingOrderRow): boolean {
  const today = todayIsoLocal();
  const horizon = addDaysIso(today, UPCOMING_STANDING_HORIZON_DAYS);
  return listStandingExecutionDates(order, addDaysIso(today, 1), horizon).length > 0;
}
