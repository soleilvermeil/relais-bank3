"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insertPayment, insertTransfer } from "@/lib/db/transactions";

function readString(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (raw === null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

function readRequiredString(formData: FormData, key: string): string {
  const value = readString(formData, key);
  if (value === null) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function readAccountId(formData: FormData, key: string): number {
  const raw = readRequiredString(formData, key);
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid account id for field: ${key}`);
  }
  return id;
}

function readAmountCents(formData: FormData, key: string): number {
  const raw = readRequiredString(formData, key);
  const amount = Number(raw);
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid amount for field: ${key}`);
  }
  return Math.round(amount * 100);
}

function revalidateBankPaths(): void {
  revalidatePath("/wealth");
  revalidatePath("/wealth/account", "layout");
  revalidatePath("/payments");
}

export async function submitPayment(formData: FormData): Promise<void> {
  const debitAccountId = readAccountId(formData, "debitAccount");
  const amountAbs = readAmountCents(formData, "amount");
  const paymentTypeRaw = readString(formData, "paymentType");
  const paymentType: "oneTime" | "standing" | null =
    paymentTypeRaw === "standing" ? "standing" : "oneTime";
  const expressRaw = readString(formData, "express");
  const isExpress = expressRaw === "yes";

  const executionDate =
    paymentType === "standing"
      ? readString(formData, "firstExecutionDate")
      : isExpress
        ? new Date().toISOString().slice(0, 10)
        : readString(formData, "executionDate");

  insertPayment({
    debit_account_id: debitAccountId,
    amount_cents: -Math.abs(amountAbs),
    execution_date: executionDate,
    accounting_text: readString(formData, "accountingTextForYou"),
    beneficiary_iban: readString(formData, "beneficiaryIban"),
    beneficiary_name: readString(formData, "beneficiaryName"),
    beneficiary_country: readString(formData, "beneficiaryCountry"),
    beneficiary_postal_code: readString(formData, "beneficiaryPostalCode"),
    beneficiary_city: readString(formData, "beneficiaryCity"),
    beneficiary_address1: readString(formData, "beneficiaryAddress1"),
    beneficiary_address2: readString(formData, "beneficiaryAddress2"),
    payment_type: paymentType,
    first_execution_date:
      paymentType === "standing" ? readString(formData, "firstExecutionDate") : null,
    frequency: paymentType === "standing" ? readString(formData, "frequency") : null,
    weekend_holiday_rule:
      paymentType === "standing" ? readString(formData, "weekendHolidayRule") : null,
    period_type: paymentType === "standing" ? readString(formData, "periodType") : null,
    end_date: paymentType === "standing" ? readString(formData, "endDate") : null,
    is_express: isExpress,
    rf_reference: readString(formData, "rfReference"),
    communication_to_beneficiary: readString(formData, "communicationToBeneficiary"),
    debtor_name: readString(formData, "debtorName"),
    debtor_country: readString(formData, "debtorCountry"),
    debtor_postal_code: readString(formData, "debtorPostalCode"),
    debtor_city: readString(formData, "debtorCity"),
    debtor_address1: readString(formData, "debtorAddress1"),
    debtor_address2: readString(formData, "debtorAddress2"),
  });

  revalidateBankPaths();
  redirect("/wealth");
}

export async function submitTransfer(formData: FormData): Promise<void> {
  const debitAccountId = readAccountId(formData, "debitAccount");
  const creditAccountId = readAccountId(formData, "creditAccount");
  const amountAbs = readAmountCents(formData, "amount");
  const executionModeRaw = readString(formData, "executionMode");
  const executionMode: "immediate" | "date" =
    executionModeRaw === "date" ? "date" : "immediate";
  const executionDate =
    executionMode === "date"
      ? readString(formData, "executionDate")
      : new Date().toISOString().slice(0, 10);

  insertTransfer({
    debit_account_id: debitAccountId,
    credit_account_id: creditAccountId,
    amount_cents: -Math.abs(amountAbs),
    execution_mode: executionMode,
    execution_date: executionDate,
    accounting_text: readString(formData, "accountingTextForYou"),
  });

  revalidateBankPaths();
  redirect("/wealth");
}
