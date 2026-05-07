export type PaymentType = "oneTime" | "standing";
export type ExpressChoice = "yes" | "no";
export type PeriodType = "unlimited" | "endDate";
export type ExecutionMode = "immediate" | "date";

export type PaymentDraft = {
  beneficiaryIban: string;
  beneficiaryBic: string;
  beneficiaryName: string;
  beneficiaryCountry: string;
  beneficiaryPostalCode: string;
  beneficiaryCity: string;
  beneficiaryAddress1: string;
  beneficiaryAddress2: string;
  paymentType: PaymentType;
  firstExecutionDate: string;
  frequency: string;
  weekendHolidayRule: string;
  periodType: PeriodType;
  endDate: string;
  debitAccount: string;
  amount: string;
  express: ExpressChoice;
  executionDate: string;
  rfReference: string;
  communicationToBeneficiary: string;
  accountingTextForYou: string;
  debtorName: string;
  debtorCountry: string;
  debtorPostalCode: string;
  debtorCity: string;
  debtorAddress1: string;
  debtorAddress2: string;
};

export type TransferDraft = {
  debitAccount: string;
  creditAccount: string;
  amount: string;
  executionMode: ExecutionMode;
  executionDate: string;
  accountingTextForYou: string;
};

export type PaymentSnapshot = PaymentDraft & {
  transactionId: number;
  placedAt: string;
};

export type TransferSnapshot = TransferDraft & {
  transactionId: number;
  placedAt: string;
};

export function emptyPaymentDraft(): PaymentDraft {
  return {
    beneficiaryIban: "",
    beneficiaryBic: "",
    beneficiaryName: "",
    beneficiaryCountry: "",
    beneficiaryPostalCode: "",
    beneficiaryCity: "",
    beneficiaryAddress1: "",
    beneficiaryAddress2: "",
    paymentType: "oneTime",
    firstExecutionDate: "",
    frequency: "",
    weekendHolidayRule: "after",
    periodType: "unlimited",
    endDate: "",
    debitAccount: "",
    amount: "",
    express: "no",
    executionDate: "",
    rfReference: "",
    communicationToBeneficiary: "",
    accountingTextForYou: "",
    debtorName: "",
    debtorCountry: "",
    debtorPostalCode: "",
    debtorCity: "",
    debtorAddress1: "",
    debtorAddress2: "",
  };
}

export function emptyTransferDraft(): TransferDraft {
  return {
    debitAccount: "",
    creditAccount: "",
    amount: "",
    executionMode: "immediate",
    executionDate: "",
    accountingTextForYou: "",
  };
}
