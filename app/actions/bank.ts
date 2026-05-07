"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteStandingOrder,
  insertPayment,
  insertStandingOrder,
  insertTransfer,
  pauseStandingOrder,
} from "@/lib/db/transactions";
import {
  clearLastPaymentCookie,
  clearLastTransferCookie,
  clearPaymentDraftCookie,
  clearTransferDraftCookie,
  readPaymentDraftCookie,
  readTransferDraftCookie,
  writeLastPaymentCookie,
  writeLastTransferCookie,
  writePaymentDraftCookie,
  writeTransferDraftCookie,
} from "@/lib/bank-cookies";
import { parseSwissQrBill } from "@/lib/qr-bill";
import type {
  ExecutionMode,
  ExpressChoice,
  PaymentDraft,
  PaymentType,
  PeriodType,
  TransferDraft,
} from "@/lib/bank-types";

function readString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return raw === null ? "" : String(raw).trim();
}

function readNonEmpty(formData: FormData, key: string): string {
  const value = readString(formData, key);
  if (value === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function parseAmountToCents(amount: string): number {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  return Math.round(parsed * 100);
}

function parseAccountId(raw: string): number {
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid account id: ${raw}`);
  }
  return id;
}

function nullIfEmpty(value: string): string | null {
  return value === "" ? null : value;
}

function revalidateBankPaths(): void {
  revalidatePath("/home");
  revalidatePath("/home/account", "layout");
  revalidatePath("/payments");
}

function paymentDraftFromFormData(formData: FormData): PaymentDraft {
  const paymentType: PaymentType =
    readString(formData, "paymentType") === "standing" ? "standing" : "oneTime";
  const periodType: PeriodType =
    readString(formData, "periodType") === "endDate" ? "endDate" : "unlimited";
  const express: ExpressChoice =
    readString(formData, "express") === "yes" ? "yes" : "no";

  readNonEmpty(formData, "debitAccount");
  readNonEmpty(formData, "amount");

  return {
    beneficiaryIban: readString(formData, "beneficiaryIban"),
    beneficiaryBic: readString(formData, "beneficiaryBic"),
    beneficiaryName: readString(formData, "beneficiaryName"),
    beneficiaryCountry: readString(formData, "beneficiaryCountry"),
    beneficiaryPostalCode: readString(formData, "beneficiaryPostalCode"),
    beneficiaryCity: readString(formData, "beneficiaryCity"),
    beneficiaryAddress1: readString(formData, "beneficiaryAddress1"),
    beneficiaryAddress2: readString(formData, "beneficiaryAddress2"),
    paymentType,
    firstExecutionDate: readString(formData, "firstExecutionDate"),
    frequency: readString(formData, "frequency"),
    weekendHolidayRule: readString(formData, "weekendHolidayRule") || "after",
    periodType,
    endDate: readString(formData, "endDate"),
    debitAccount: readString(formData, "debitAccount"),
    amount: readString(formData, "amount"),
    express,
    executionDate: readString(formData, "executionDate"),
    rfReference: readString(formData, "rfReference"),
    communicationToBeneficiary: readString(formData, "communicationToBeneficiary"),
    accountingTextForYou: readString(formData, "accountingTextForYou"),
    debtorName: readString(formData, "debtorName"),
    debtorCountry: readString(formData, "debtorCountry"),
    debtorPostalCode: readString(formData, "debtorPostalCode"),
    debtorCity: readString(formData, "debtorCity"),
    debtorAddress1: readString(formData, "debtorAddress1"),
    debtorAddress2: readString(formData, "debtorAddress2"),
  };
}

function transferDraftFromFormData(formData: FormData): TransferDraft {
  const executionMode: ExecutionMode =
    readString(formData, "executionMode") === "date" ? "date" : "immediate";

  readNonEmpty(formData, "debitAccount");
  readNonEmpty(formData, "creditAccount");
  readNonEmpty(formData, "amount");

  return {
    debitAccount: readString(formData, "debitAccount"),
    creditAccount: readString(formData, "creditAccount"),
    amount: readString(formData, "amount"),
    executionMode,
    executionDate: readString(formData, "executionDate"),
    accountingTextForYou: readString(formData, "accountingTextForYou"),
  };
}

export async function submitScannedQrBill(payload: string): Promise<void> {
  const draft = parseSwissQrBill(payload);
  if (!draft) {
    throw new Error("Invalid Swiss QR-bill payload");
  }
  await writePaymentDraftCookie(draft);
  redirect("/make-payment");
}

export async function submitPayment(formData: FormData): Promise<void> {
  const draft = paymentDraftFromFormData(formData);
  await writePaymentDraftCookie(draft);
  redirect("/make-payment/review");
}

export async function confirmPayment(): Promise<void> {
  const draft = await readPaymentDraftCookie();
  if (!draft) {
    redirect("/make-payment");
  }

  const debitAccountId = parseAccountId(draft.debitAccount);
  const amountCents = parseAmountToCents(draft.amount);
  const isExpress = draft.express === "yes";

  const transactionId =
    draft.paymentType === "standing"
      ? insertStandingOrder({
          debit_account_id: debitAccountId,
          amount_cents: -Math.abs(amountCents),
          start_date: nullIfEmpty(draft.firstExecutionDate) ?? new Date().toISOString().slice(0, 10),
          end_date:
            draft.periodType === "endDate"
              ? nullIfEmpty(draft.endDate)
              : null,
          frequency:
            draft.frequency === "weekly" ||
            draft.frequency === "monthly" ||
            draft.frequency === "quarterly" ||
            draft.frequency === "yearly"
              ? draft.frequency
              : "monthly",
          weekend_holiday_rule: nullIfEmpty(draft.weekendHolidayRule) ?? "after",
          beneficiary_iban: nullIfEmpty(draft.beneficiaryIban),
          beneficiary_bic: nullIfEmpty(draft.beneficiaryBic),
          beneficiary_name: nullIfEmpty(draft.beneficiaryName),
          beneficiary_country: nullIfEmpty(draft.beneficiaryCountry),
          beneficiary_postal_code: nullIfEmpty(draft.beneficiaryPostalCode),
          beneficiary_city: nullIfEmpty(draft.beneficiaryCity),
          beneficiary_address1: nullIfEmpty(draft.beneficiaryAddress1),
          beneficiary_address2: nullIfEmpty(draft.beneficiaryAddress2),
          rf_reference: nullIfEmpty(draft.rfReference),
          communication_to_beneficiary: nullIfEmpty(draft.communicationToBeneficiary),
          accounting_text: nullIfEmpty(draft.accountingTextForYou),
          debtor_name: nullIfEmpty(draft.debtorName),
          debtor_country: nullIfEmpty(draft.debtorCountry),
          debtor_postal_code: nullIfEmpty(draft.debtorPostalCode),
          debtor_city: nullIfEmpty(draft.debtorCity),
          debtor_address1: nullIfEmpty(draft.debtorAddress1),
          debtor_address2: nullIfEmpty(draft.debtorAddress2),
        })
      : insertPayment({
          debit_account_id: debitAccountId,
          amount_cents: -Math.abs(amountCents),
          execution_date: isExpress
            ? new Date().toISOString().slice(0, 10)
            : nullIfEmpty(draft.executionDate),
          accounting_text: nullIfEmpty(draft.accountingTextForYou),
          beneficiary_iban: nullIfEmpty(draft.beneficiaryIban),
          beneficiary_bic: nullIfEmpty(draft.beneficiaryBic),
          beneficiary_name: nullIfEmpty(draft.beneficiaryName),
          beneficiary_country: nullIfEmpty(draft.beneficiaryCountry),
          beneficiary_postal_code: nullIfEmpty(draft.beneficiaryPostalCode),
          beneficiary_city: nullIfEmpty(draft.beneficiaryCity),
          beneficiary_address1: nullIfEmpty(draft.beneficiaryAddress1),
          beneficiary_address2: nullIfEmpty(draft.beneficiaryAddress2),
          payment_type: "oneTime",
          first_execution_date: null,
          frequency: null,
          weekend_holiday_rule: null,
          period_type: null,
          end_date: null,
          is_express: isExpress,
          rf_reference: nullIfEmpty(draft.rfReference),
          communication_to_beneficiary: nullIfEmpty(draft.communicationToBeneficiary),
          debtor_name: nullIfEmpty(draft.debtorName),
          debtor_country: nullIfEmpty(draft.debtorCountry),
          debtor_postal_code: nullIfEmpty(draft.debtorPostalCode),
          debtor_city: nullIfEmpty(draft.debtorCity),
          debtor_address1: nullIfEmpty(draft.debtorAddress1),
          debtor_address2: nullIfEmpty(draft.debtorAddress2),
        });

  await writeLastPaymentCookie({
    ...draft,
    transactionId,
    placedAt: new Date().toISOString(),
  });
  await clearPaymentDraftCookie();
  revalidateBankPaths();
  redirect("/make-payment/confirmation");
}

export async function dismissPaymentConfirmation(): Promise<void> {
  await clearLastPaymentCookie();
  redirect("/make-payment");
}

export async function submitTransfer(formData: FormData): Promise<void> {
  const draft = transferDraftFromFormData(formData);
  await writeTransferDraftCookie(draft);
  redirect("/make-transfer/review");
}

export async function confirmTransfer(): Promise<void> {
  const draft = await readTransferDraftCookie();
  if (!draft) {
    redirect("/make-transfer");
  }

  const debitAccountId = parseAccountId(draft.debitAccount);
  const creditAccountId = parseAccountId(draft.creditAccount);
  const amountCents = parseAmountToCents(draft.amount);
  const executionDate =
    draft.executionMode === "date"
      ? nullIfEmpty(draft.executionDate)
      : new Date().toISOString().slice(0, 10);

  const transactionId = insertTransfer({
    debit_account_id: debitAccountId,
    credit_account_id: creditAccountId,
    amount_cents: -Math.abs(amountCents),
    execution_mode: draft.executionMode,
    execution_date: executionDate,
    accounting_text: nullIfEmpty(draft.accountingTextForYou),
  });

  await writeLastTransferCookie({
    ...draft,
    transactionId,
    placedAt: new Date().toISOString(),
  });
  await clearTransferDraftCookie();
  revalidateBankPaths();
  redirect("/make-transfer/confirmation");
}

export async function dismissTransferConfirmation(): Promise<void> {
  await clearLastTransferCookie();
  redirect("/make-transfer");
}

export async function pauseStandingOrderAction(formData: FormData): Promise<void> {
  const standingOrderIdRaw = readNonEmpty(formData, "standingOrderId");
  const standingOrderId = Number(standingOrderIdRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) {
    throw new Error(`Invalid standing order id: ${standingOrderIdRaw}`);
  }
  const fromAccountRaw = readString(formData, "fromAccount");
  pauseStandingOrder(standingOrderId);
  revalidateBankPaths();
  if (fromAccountRaw !== "") {
    redirect(`/home/account/${fromAccountRaw}`);
  }
  redirect("/home");
}

export async function deleteStandingOrderAction(formData: FormData): Promise<void> {
  const standingOrderIdRaw = readNonEmpty(formData, "standingOrderId");
  const standingOrderId = Number(standingOrderIdRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) {
    throw new Error(`Invalid standing order id: ${standingOrderIdRaw}`);
  }
  const fromAccountRaw = readString(formData, "fromAccount");
  deleteStandingOrder(standingOrderId);
  revalidateBankPaths();
  if (fromAccountRaw !== "") {
    redirect(`/home/account/${fromAccountRaw}`);
  }
  redirect("/home");
}
