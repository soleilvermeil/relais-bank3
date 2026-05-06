import { getDb } from "./client";

export type TransactionKind =
  | "payment"
  | "transfer"
  | "purchaseService"
  | "credit"
  | "debit";

export type TransactionRow = {
  id: number;
  kind: TransactionKind;
  created_at: string;
  debit_account_id: number | null;
  credit_account_id: number | null;
  amount_cents: number;
  currency: string;
  execution_date: string | null;
  accounting_text: string | null;

  beneficiary_iban: string | null;
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

  counterparty_name: string | null;
  counterparty_iban: string | null;
};

export type Transaction = Omit<TransactionRow, "amount_cents" | "is_express"> & {
  amount: number;
  is_express: boolean | null;
};

function rowToTransaction(row: TransactionRow, accountId: number): Transaction {
  const { amount_cents, is_express, ...rest } = row;
  const amountForAccount =
    row.kind === "transfer" && row.credit_account_id === accountId
      ? Math.abs(amount_cents)
      : amount_cents;
  return {
    ...rest,
    amount: amountForAccount / 100,
    is_express:
      is_express === null ? null : is_express === 1,
  };
}

export function listTransactionsForAccount(accountId: number): Transaction[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM transactions
       WHERE debit_account_id = @id OR credit_account_id = @id
       ORDER BY execution_date DESC, id DESC`,
    )
    .all({ id: accountId }) as TransactionRow[];
  return rows.map((row) => rowToTransaction(row, accountId));
}

/** Net CHF cents for an account: debits use stored amount; transfers credit the other leg with -amount. */
export function computeBalanceCentsForAccount(accountId: number): number {
  const row = getDb()
    .prepare(
      `SELECT
         COALESCE((SELECT SUM(amount_cents) FROM transactions WHERE debit_account_id = @id), 0)
         + COALESCE(
           (SELECT SUM(-amount_cents) FROM transactions
            WHERE credit_account_id = @id AND kind = 'transfer'),
           0
         ) AS balance_cents`,
    )
    .get({ id: accountId }) as { balance_cents: number };
  return row.balance_cents;
}

/** One round-trip: map account id -> net balance in cents from all transactions. */
export function computeBalanceCentsByAccountId(): Map<number, number> {
  const rows = getDb()
    .prepare(
      `SELECT a.id AS account_id,
         COALESCE(d.debit_sum, 0) + COALESCE(c.credit_transfer_sum, 0) AS balance_cents
       FROM accounts a
       LEFT JOIN (
         SELECT debit_account_id AS id, SUM(amount_cents) AS debit_sum
         FROM transactions
         WHERE debit_account_id IS NOT NULL
         GROUP BY debit_account_id
       ) d ON d.id = a.id
       LEFT JOIN (
         SELECT credit_account_id AS id, SUM(-amount_cents) AS credit_transfer_sum
         FROM transactions
         WHERE credit_account_id IS NOT NULL AND kind = 'transfer'
         GROUP BY credit_account_id
       ) c ON c.id = a.id`,
    )
    .all() as { account_id: number; balance_cents: number }[];

  const map = new Map<number, number>();
  for (const r of rows) {
    map.set(r.account_id, r.balance_cents);
  }
  return map;
}

export type PaymentInsertInput = {
  debit_account_id: number;
  amount_cents: number;
  execution_date: string | null;
  accounting_text: string | null;
  beneficiary_iban: string | null;
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

export function insertPayment(input: PaymentInsertInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO transactions (
         kind, debit_account_id, amount_cents, currency,
         execution_date, accounting_text,
         beneficiary_iban, beneficiary_name, beneficiary_country,
         beneficiary_postal_code, beneficiary_city,
         beneficiary_address1, beneficiary_address2,
         payment_type, first_execution_date, frequency,
         weekend_holiday_rule, period_type, end_date,
         is_express, rf_reference, communication_to_beneficiary,
         debtor_name, debtor_country, debtor_postal_code,
         debtor_city, debtor_address1, debtor_address2
       ) VALUES (
         'payment', @debit_account_id, @amount_cents, 'CHF',
         @execution_date, @accounting_text,
         @beneficiary_iban, @beneficiary_name, @beneficiary_country,
         @beneficiary_postal_code, @beneficiary_city,
         @beneficiary_address1, @beneficiary_address2,
         @payment_type, @first_execution_date, @frequency,
         @weekend_holiday_rule, @period_type, @end_date,
         @is_express, @rf_reference, @communication_to_beneficiary,
         @debtor_name, @debtor_country, @debtor_postal_code,
         @debtor_city, @debtor_address1, @debtor_address2
       )`,
    )
    .run({
      ...input,
      is_express: input.is_express ? 1 : 0,
    });
  return Number(result.lastInsertRowid);
}

export type TransferInsertInput = {
  debit_account_id: number;
  credit_account_id: number;
  amount_cents: number;
  execution_mode: "immediate" | "date";
  execution_date: string | null;
  accounting_text: string | null;
};

export function insertTransfer(input: TransferInsertInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO transactions (
         kind, debit_account_id, credit_account_id, amount_cents, currency,
         execution_mode, execution_date, accounting_text
       ) VALUES (
         'transfer', @debit_account_id, @credit_account_id, @amount_cents, 'CHF',
         @execution_mode, @execution_date, @accounting_text
       )`,
    )
    .run(input);
  return Number(result.lastInsertRowid);
}
