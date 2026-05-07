import type { PaymentDraft, PaymentType, PeriodType, TransferDraft } from "@/lib/bank-types";
import type { TransactionRow } from "@/lib/db/transactions";

function amountCentsToDraftString(cents: number): string {
  return String(Math.abs(cents) / 100);
}

function parsePaymentType(value: string | null): PaymentType {
  return value === "standing" ? "standing" : "oneTime";
}

function parsePeriodType(value: string | null): PeriodType {
  return value === "endDate" ? "endDate" : "unlimited";
}

export function transactionRowToPaymentDraft(row: TransactionRow): PaymentDraft {
  const paymentType = parsePaymentType(row.payment_type);
  const express = row.is_express === 1 ? "yes" : "no";
  return {
    beneficiaryIban: row.beneficiary_iban ?? "",
    beneficiaryBic: row.beneficiary_bic ?? "",
    beneficiaryName: row.beneficiary_name ?? "",
    beneficiaryCountry: row.beneficiary_country ?? "",
    beneficiaryPostalCode: row.beneficiary_postal_code ?? "",
    beneficiaryCity: row.beneficiary_city ?? "",
    beneficiaryAddress1: row.beneficiary_address1 ?? "",
    beneficiaryAddress2: row.beneficiary_address2 ?? "",
    paymentType,
    firstExecutionDate: row.first_execution_date ?? row.execution_date ?? "",
    frequency: row.frequency ?? "",
    weekendHolidayRule: row.weekend_holiday_rule ?? "after",
    periodType: parsePeriodType(row.period_type),
    endDate: row.end_date ?? "",
    debitAccount: row.debit_account_id != null ? String(row.debit_account_id) : "",
    amount: amountCentsToDraftString(row.amount_cents),
    express,
    executionDate: row.execution_date ?? "",
    rfReference: row.rf_reference ?? "",
    communicationToBeneficiary: row.communication_to_beneficiary ?? "",
    accountingTextForYou: row.accounting_text ?? "",
    debtorName: row.debtor_name ?? "",
    debtorCountry: row.debtor_country ?? "",
    debtorPostalCode: row.debtor_postal_code ?? "",
    debtorCity: row.debtor_city ?? "",
    debtorAddress1: row.debtor_address1 ?? "",
    debtorAddress2: row.debtor_address2 ?? "",
  };
}

export function transactionRowToTransferDraft(row: TransactionRow): TransferDraft {
  const mode = row.execution_mode === "date" ? "date" : "immediate";
  return {
    debitAccount: row.debit_account_id != null ? String(row.debit_account_id) : "",
    creditAccount: row.credit_account_id != null ? String(row.credit_account_id) : "",
    amount: amountCentsToDraftString(row.amount_cents),
    executionMode: mode,
    executionDate: row.execution_date ?? "",
    accountingTextForYou: row.accounting_text ?? "",
  };
}
