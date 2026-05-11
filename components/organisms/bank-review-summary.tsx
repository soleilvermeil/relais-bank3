import type { TFunction } from "i18next";
import { formatChfCurrency } from "@/lib/bank-money";
import { SectionTitle } from "@/components/atoms/section-title";
import type { PaymentDraft, TransferDraft } from "@/lib/bank-types";
import type { TransactionRow } from "@/lib/db/transactions";

const COUNTRY_LABELS: Record<string, string> = {
  ch: "Switzerland / Suisse",
  fr: "France",
  de: "Germany / Allemagne",
  it: "Italy / Italie",
};

function dash(value: string): string {
  return value.trim() === "" ? "—" : value;
}

function formatAmount(amount: string): string {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return dash(amount);
  return formatChfCurrency(-Math.abs(parsed));
}

function paymentTypeLabel(t: TFunction, value: string): string {
  if (value === "standing") return t("bankPayment.options.standingOrder");
  return t("bankPayment.options.oneTime");
}

function frequencyLabel(t: TFunction, value: string): string {
  switch (value) {
    case "weekly":
      return t("bankPayment.options.weekly");
    case "monthly":
      return t("bankPayment.options.monthly");
    case "quarterly":
      return t("bankPayment.options.quarterly");
    case "yearly":
      return t("bankPayment.options.yearly");
    default:
      return dash(value);
  }
}

function holidayRuleLabel(t: TFunction, value: string): string {
  if (value === "before") return t("bankPayment.options.beforeHolidays");
  return t("bankPayment.options.afterHolidays");
}

function periodTypeLabel(t: TFunction, value: string): string {
  if (value === "endDate") return t("bankPayment.options.endDate");
  return t("bankPayment.options.unlimited");
}

function expressLabel(t: TFunction, value: string): string {
  if (value === "yes") return t("bankPayment.options.expressYes");
  return t("bankPayment.options.expressNo");
}

function executionModeLabel(t: TFunction, value: string): string {
  if (value === "date") return t("bankTransfer.options.selectDate");
  return t("bankTransfer.options.immediate");
}

function countryLabel(value: string): string {
  return COUNTRY_LABELS[value] ?? dash(value);
}

export type SummaryRow = {
  label: string;
  value: string;
};

type Row = SummaryRow;

export function SummarySection({ title, rows }: { title: string; rows: SummaryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="space-y-4">
      <SectionTitle as="h2">{title}</SectionTitle>
      <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="space-y-0.5">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-sm font-medium text-foreground break-words">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

type PaymentSummaryProps = {
  draft: PaymentDraft;
  debitAccountLabel: string;
  t: TFunction;
};

export function BankPaymentReviewSummary({
  draft,
  debitAccountLabel,
  t,
}: PaymentSummaryProps) {
  const beneficiaryRows: Row[] = [
    { label: t("bankPayment.fields.beneficiaryIban"), value: dash(draft.beneficiaryIban) },
    { label: t("bankPayment.fields.beneficiaryBic"), value: dash(draft.beneficiaryBic) },
    { label: t("bankPayment.fields.beneficiaryName"), value: dash(draft.beneficiaryName) },
    { label: t("bankPayment.fields.country"), value: countryLabel(draft.beneficiaryCountry) },
    { label: t("bankPayment.fields.postalCode"), value: dash(draft.beneficiaryPostalCode) },
    { label: t("bankPayment.fields.locality"), value: dash(draft.beneficiaryCity) },
    { label: t("bankPayment.fields.street"), value: dash(draft.beneficiaryAddress1) },
    { label: t("bankPayment.fields.houseNumber"), value: dash(draft.beneficiaryAddress2) },
  ];

  const detailsRows: Row[] = [
    { label: t("bankPayment.fields.paymentType"), value: paymentTypeLabel(t, draft.paymentType) },
    { label: t("bankPayment.fields.debitAccount"), value: dash(debitAccountLabel) },
    { label: t("bankPayment.fields.amount"), value: formatAmount(draft.amount) },
    { label: t("bankPayment.fields.express"), value: expressLabel(t, draft.express) },
  ];

  if (draft.paymentType === "standing") {
    detailsRows.push(
      {
        label: t("bankPayment.fields.firstExecutionDate"),
        value: dash(draft.firstExecutionDate),
      },
      { label: t("bankPayment.fields.frequency"), value: frequencyLabel(t, draft.frequency) },
      {
        label: t("bankPayment.fields.weekendHolidayRule"),
        value: holidayRuleLabel(t, draft.weekendHolidayRule),
      },
      {
        label: t("bankPayment.fields.period"),
        value: periodTypeLabel(t, draft.periodType),
      },
    );
    if (draft.periodType === "endDate") {
      detailsRows.push({
        label: t("bankPayment.fields.endDate"),
        value: dash(draft.endDate),
      });
    }
  } else if (draft.express !== "yes") {
    detailsRows.push({
      label: t("bankPayment.fields.executionDate"),
      value: dash(draft.executionDate),
    });
  }

  const extraRows: Row[] = [
    { label: t("bankPayment.fields.rfReference"), value: dash(draft.rfReference) },
    {
      label: t("bankPayment.fields.communicationToBeneficiary"),
      value: dash(draft.communicationToBeneficiary),
    },
    {
      label: t("bankPayment.fields.accountingTextForYou"),
      value: dash(draft.accountingTextForYou),
    },
  ];

  const debtorRows: Row[] = [
    { label: t("bankPayment.fields.debtorName"), value: dash(draft.debtorName) },
    { label: t("bankPayment.fields.country"), value: countryLabel(draft.debtorCountry) },
    { label: t("bankPayment.fields.postalCode"), value: dash(draft.debtorPostalCode) },
    { label: t("bankPayment.fields.locality"), value: dash(draft.debtorCity) },
    { label: t("bankPayment.fields.street"), value: dash(draft.debtorAddress1) },
    { label: t("bankPayment.fields.houseNumber"), value: dash(draft.debtorAddress2) },
  ];

  const hasDebtorInfo = debtorRows.some((row) => row.value !== "—");

  return (
    <div className="space-y-8">
      <SummarySection
        title={t("bankPayment.sections.beneficiary")}
        rows={beneficiaryRows}
      />
      <SummarySection
        title={t("bankPayment.sections.paymentDetails")}
        rows={detailsRows}
      />
      <SummarySection title={t("bankPayment.sections.details")} rows={extraRows} />
      {hasDebtorInfo ? (
        <SummarySection
          title={t("bankPayment.sections.debtorOptional")}
          rows={debtorRows}
        />
      ) : null}
    </div>
  );
}

type TransferSummaryProps = {
  draft: TransferDraft;
  debitAccountLabel: string;
  creditAccountLabel: string;
  t: TFunction;
};

export function BankTransferReviewSummary({
  draft,
  debitAccountLabel,
  creditAccountLabel,
  t,
}: TransferSummaryProps) {
  const rows: Row[] = [
    { label: t("bankTransfer.fields.debitAccount"), value: dash(debitAccountLabel) },
    { label: t("bankTransfer.fields.creditAccount"), value: dash(creditAccountLabel) },
    { label: t("bankTransfer.fields.amount"), value: formatAmount(draft.amount) },
    {
      label: t("bankTransfer.fields.execution"),
      value: executionModeLabel(t, draft.executionMode),
    },
  ];

  if (draft.executionMode === "date") {
    rows.push({
      label: t("bankTransfer.fields.executionDate"),
      value: dash(draft.executionDate),
    });
  }

  rows.push({
    label: t("bankTransfer.fields.accountingTextForYou"),
    value: dash(draft.accountingTextForYou),
  });

  return (
    <div className="space-y-8">
      <SummarySection title={t("bankTransfer.sections.transferDetails")} rows={rows} />
    </div>
  );
}

type FlowSummaryProps = {
  row: TransactionRow;
  debitAccountLabel: string | null;
  creditAccountLabel: string | null;
  t: TFunction;
};

/** Credits, debits, and card/purchase lines — same card layout as payment/transfer review. */
export function BankFlowTransactionReviewSummary({
  row,
  debitAccountLabel,
  creditAccountLabel,
  t,
}: FlowSummaryProps) {
  const kindKey =
    row.kind === "purchaseService"
      ? "bankTransactionDetail.kinds.purchaseService"
      : row.kind === "credit"
        ? "bankTransactionDetail.kinds.credit"
        : "bankTransactionDetail.kinds.debit";

  const rows: Row[] = [
    { label: t("bankTransactionDetail.fields.kind"), value: t(kindKey) },
    {
      label: t("bankTransactionDetail.fields.executionDate"),
      value: dash(row.execution_date ?? ""),
    },
    {
      label: t("bankTransactionDetail.fields.amount"),
      value: formatChfCurrency(row.amount_cents / 100),
    },
  ];

  if (debitAccountLabel) {
    rows.push({
      label: t("bankTransactionDetail.fields.debitAccount"),
      value: debitAccountLabel,
    });
  }
  if (creditAccountLabel) {
    rows.push({
      label: t("bankTransactionDetail.fields.creditAccount"),
      value: creditAccountLabel,
    });
  }

  const hasCounterparty =
    (row.counterparty_name ?? "").trim() !== "" || (row.counterparty_iban ?? "").trim() !== "";
  if (hasCounterparty) {
    rows.push(
      {
        label: t("bankTransactionDetail.fields.counterparty"),
        value: dash(row.counterparty_name ?? ""),
      },
      {
        label: t("bankTransactionDetail.fields.counterpartyIban"),
        value: dash(row.counterparty_iban ?? ""),
      },
    );
  }

  if ((row.accounting_text ?? "").trim() !== "") {
    rows.push({
      label: t("bankTransactionDetail.fields.accountingText"),
      value: row.accounting_text ?? "",
    });
  }

  return (
    <div className="space-y-8">
      <SummarySection
        title={t("bankTransactionDetail.sections.details")}
        rows={rows}
      />
    </div>
  );
}
