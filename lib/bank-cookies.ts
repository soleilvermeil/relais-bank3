import { cookies } from "next/headers";
import {
  emptyPaymentDraft,
  emptyTransferDraft,
  type ExecutionMode,
  type ExpressChoice,
  type PaymentDraft,
  type PaymentSnapshot,
  type PaymentType,
  type PeriodType,
  type TransferDraft,
  type TransferSnapshot,
} from "@/lib/bank-types";
import { findUserByContract } from "@/lib/db/users";

export const BANK_COOKIE_NAMES = {
  paymentDraft: "bank_payment_draft",
  transferDraft: "bank_transfer_draft",
  lastPayment: "bank_last_payment",
  lastTransfer: "bank_last_transfer",
  userContract: "bank_user_contract",
} as const;

const WEEK_SEC = 60 * 60 * 24 * 7;

function bankCookieBase() {
  return {
    httpOnly: true,
    path: "/" as const,
    maxAge: WEEK_SEC,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asPaymentType(value: unknown): PaymentType {
  return value === "standing" ? "standing" : "oneTime";
}

function asPeriodType(value: unknown): PeriodType {
  return value === "endDate" ? "endDate" : "unlimited";
}

function asExpressChoice(value: unknown): ExpressChoice {
  return value === "yes" ? "yes" : "no";
}

function asExecutionMode(value: unknown): ExecutionMode {
  return value === "date" ? "date" : "immediate";
}

function parsePaymentDraft(raw: string | undefined): PaymentDraft | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object") return null;
    return {
      beneficiaryIban: asString(data.beneficiaryIban),
      beneficiaryBic: asString(data.beneficiaryBic),
      beneficiaryName: asString(data.beneficiaryName),
      beneficiaryCountry: asString(data.beneficiaryCountry),
      beneficiaryPostalCode: asString(data.beneficiaryPostalCode),
      beneficiaryCity: asString(data.beneficiaryCity),
      beneficiaryAddress1: asString(data.beneficiaryAddress1),
      beneficiaryAddress2: asString(data.beneficiaryAddress2),
      paymentType: asPaymentType(data.paymentType),
      firstExecutionDate: asString(data.firstExecutionDate),
      frequency: asString(data.frequency),
      weekendHolidayRule: asString(data.weekendHolidayRule) || "after",
      periodType: asPeriodType(data.periodType),
      endDate: asString(data.endDate),
      debitAccount: asString(data.debitAccount),
      amount: asString(data.amount),
      express: asExpressChoice(data.express),
      executionDate: asString(data.executionDate),
      rfReference: asString(data.rfReference),
      communicationToBeneficiary: asString(data.communicationToBeneficiary),
      accountingTextForYou: asString(data.accountingTextForYou),
      debtorName: asString(data.debtorName),
      debtorCountry: asString(data.debtorCountry),
      debtorPostalCode: asString(data.debtorPostalCode),
      debtorCity: asString(data.debtorCity),
      debtorAddress1: asString(data.debtorAddress1),
      debtorAddress2: asString(data.debtorAddress2),
    };
  } catch {
    return null;
  }
}

function parseTransferDraft(raw: string | undefined): TransferDraft | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object") return null;
    return {
      debitAccount: asString(data.debitAccount),
      creditAccount: asString(data.creditAccount),
      amount: asString(data.amount),
      executionMode: asExecutionMode(data.executionMode),
      executionDate: asString(data.executionDate),
      accountingTextForYou: asString(data.accountingTextForYou),
    };
  } catch {
    return null;
  }
}

function parsePaymentSnapshot(raw: string | undefined): PaymentSnapshot | null {
  const draft = parsePaymentDraft(raw);
  if (!draft) return null;
  try {
    const data = JSON.parse(raw!) as Record<string, unknown>;
    const transactionId = Number(data.transactionId);
    const placedAt = asString(data.placedAt);
    if (!Number.isFinite(transactionId) || transactionId <= 0) return null;
    if (!placedAt) return null;
    return { ...draft, transactionId, placedAt };
  } catch {
    return null;
  }
}

function parseTransferSnapshot(raw: string | undefined): TransferSnapshot | null {
  const draft = parseTransferDraft(raw);
  if (!draft) return null;
  try {
    const data = JSON.parse(raw!) as Record<string, unknown>;
    const transactionId = Number(data.transactionId);
    const placedAt = asString(data.placedAt);
    if (!Number.isFinite(transactionId) || transactionId <= 0) return null;
    if (!placedAt) return null;
    return { ...draft, transactionId, placedAt };
  } catch {
    return null;
  }
}

export async function readPaymentDraftCookie(): Promise<PaymentDraft | null> {
  const store = await cookies();
  return parsePaymentDraft(store.get(BANK_COOKIE_NAMES.paymentDraft)?.value);
}

export async function writePaymentDraftCookie(draft: PaymentDraft): Promise<void> {
  const store = await cookies();
  store.set(
    BANK_COOKIE_NAMES.paymentDraft,
    JSON.stringify(draft),
    bankCookieBase(),
  );
}

export async function clearPaymentDraftCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BANK_COOKIE_NAMES.paymentDraft);
}

export async function readTransferDraftCookie(): Promise<TransferDraft | null> {
  const store = await cookies();
  return parseTransferDraft(store.get(BANK_COOKIE_NAMES.transferDraft)?.value);
}

export async function writeTransferDraftCookie(draft: TransferDraft): Promise<void> {
  const store = await cookies();
  store.set(
    BANK_COOKIE_NAMES.transferDraft,
    JSON.stringify(draft),
    bankCookieBase(),
  );
}

export async function clearTransferDraftCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BANK_COOKIE_NAMES.transferDraft);
}

export async function readLastPaymentCookie(): Promise<PaymentSnapshot | null> {
  const store = await cookies();
  return parsePaymentSnapshot(store.get(BANK_COOKIE_NAMES.lastPayment)?.value);
}

export async function writeLastPaymentCookie(
  snapshot: PaymentSnapshot,
): Promise<void> {
  const store = await cookies();
  store.set(
    BANK_COOKIE_NAMES.lastPayment,
    JSON.stringify(snapshot),
    bankCookieBase(),
  );
}

export async function clearLastPaymentCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BANK_COOKIE_NAMES.lastPayment);
}

export async function readLastTransferCookie(): Promise<TransferSnapshot | null> {
  const store = await cookies();
  return parseTransferSnapshot(store.get(BANK_COOKIE_NAMES.lastTransfer)?.value);
}

export async function writeLastTransferCookie(
  snapshot: TransferSnapshot,
): Promise<void> {
  const store = await cookies();
  store.set(
    BANK_COOKIE_NAMES.lastTransfer,
    JSON.stringify(snapshot),
    bankCookieBase(),
  );
}

export async function clearLastTransferCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BANK_COOKIE_NAMES.lastTransfer);
}

export async function readUserContractFromCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(BANK_COOKIE_NAMES.userContract)?.value;
  return raw && raw.length > 0 ? raw : null;
}

export async function writeUserContractCookie(contract: string): Promise<void> {
  const store = await cookies();
  store.set(BANK_COOKIE_NAMES.userContract, contract, bankCookieBase());
}

export async function clearUserContractCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BANK_COOKIE_NAMES.userContract);
}

/** Clears auth cookie and all bank draft / confirmation cookies. */
export async function clearAllBankCookies(): Promise<void> {
  await clearUserContractCookie();
  await clearPaymentDraftCookie();
  await clearTransferDraftCookie();
  await clearLastPaymentCookie();
  await clearLastTransferCookie();
}

export async function isUserConnectedFromCookie(): Promise<boolean> {
  const contract = await readUserContractFromCookie();
  return contract != null;
}

/** Resolves the logged-in user id from the contract cookie, or null. Clears stale cookies. */
export async function getCurrentUserId(): Promise<number | null> {
  const contract = await readUserContractFromCookie();
  if (!contract) return null;
  const user = findUserByContract(contract);
  if (!user) {
    await clearUserContractCookie();
    return null;
  }
  return user.id;
}

// Re-export for convenience.
export { emptyPaymentDraft, emptyTransferDraft };
