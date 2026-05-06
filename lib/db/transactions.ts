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

function rowToTransaction(row: TransactionRow): Transaction {
  const { amount_cents, is_express, ...rest } = row;
  return {
    ...rest,
    amount: amount_cents / 100,
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
  return rows.map(rowToTransaction);
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
