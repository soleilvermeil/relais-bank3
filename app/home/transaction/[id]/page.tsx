import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pause, Play } from "lucide-react";
import {
  BankFlowTransactionReviewSummary,
  BankPaymentReviewSummary,
  BankTransferReviewSummary,
} from "@/components/organisms/bank-review-summary";
import { BankPrintButton } from "@/components/molecules/bank-print-button";
import { ConfirmableDeleteStandingOrderButton } from "@/components/molecules/confirmable-delete-standing-order-button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { deleteStandingOrderAction } from "@/app/actions/bank";
import {
  transactionRowToPaymentDraft,
  transactionRowToTransferDraft,
} from "@/lib/bank-transaction-mappers";
import { listAccountsGroupedByCategory, localizeAccountGroups } from "@/lib/db/accounts";
import {
  getStandingOrderOccurrenceBySyntheticId,
  getTransactionById,
} from "@/lib/db/transactions";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function accountLabel(
  id: number | null,
  accountById: Map<number, { identifier: string; name: string }>,
): string {
  if (id == null) return "";
  const acc = accountById.get(id);
  return acc ? `${acc.identifier} (${acc.name})` : `#${id}`;
}

export default async function WealthTransactionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromAccount?: string; mode?: string }>;
}) {
  const { id: idParam } = await params;
  const idRaw = decodeURIComponent(idParam);
  const { fromAccount: fromRaw, mode } = await searchParams;
  const showStandingSummary = mode === "standing-summary";
  const isSyntheticStanding = idRaw.startsWith("so:");
  const syntheticOccurrence = isSyntheticStanding
    ? getStandingOrderOccurrenceBySyntheticId(idRaw)
    : null;
  const txId = Number(idRaw);
  const row =
    !isSyntheticStanding && Number.isFinite(txId) && txId > 0
      ? getTransactionById(txId)
      : null;
  if (!row && !syntheticOccurrence) {
    notFound();
  }

  const t = await getServerT();
  const localizedGroups = localizeAccountGroups(listAccountsGroupedByCategory(), t);
  const localizedAccounts = localizedGroups.flatMap((group) => group.accounts);
  const accountById = new Map(localizedAccounts.map((account) => [account.id, account]));

  const fromAccountId = fromRaw != null ? Number(fromRaw) : NaN;
  const backAccount =
    Number.isFinite(fromAccountId) && fromAccountId > 0
      ? (accountById.get(fromAccountId) ?? null)
      : null;

  const intlLocale = await getIntlLocale();
  const createdAt = new Date(
    row?.created_at ?? syntheticOccurrence?.standingOrder.created_at ?? new Date().toISOString(),
  );

  const debitLabel = accountLabel(
    row?.debit_account_id ?? syntheticOccurrence?.standingOrder.debit_account_id ?? null,
    accountById,
  );
  const creditLabel = accountLabel(row?.credit_account_id ?? null, accountById);

  const backHref = backAccount ? `/home/account/${backAccount.id}` : "/home";
  const backLabel = backAccount
    ? t("bankTransactionDetail.backToAccount")
    : t("bankTransactionDetail.backToWealth");
  const standingOrderActionLabel = syntheticOccurrence?.standingOrder.is_active === 1
    ? t("bankTransactionDetail.actions.pauseStandingOrder")
    : t("bankTransactionDetail.actions.resumeStandingOrder");

  const titlePayment = t("bankReview.titlePayment");
  const titleTransfer = t("bankReview.titleTransfer");
  let heading = t("bankTransactionDetail.titleFallback");
  if (syntheticOccurrence && showStandingSummary) {
    heading = titlePayment;
  } else if (syntheticOccurrence) {
    heading = titleTransfer;
  } else if (row?.kind === "payment") {
    heading = titlePayment;
  } else if (row?.kind === "transfer") {
    heading = titleTransfer;
  }

  let body: ReactElement | null = null;

  if (syntheticOccurrence) {
    const standing = syntheticOccurrence.standingOrder;
    if (showStandingSummary) {
      const draft = {
        beneficiaryIban: standing.beneficiary_iban ?? "",
        beneficiaryBic: standing.beneficiary_bic ?? "",
        beneficiaryName: standing.beneficiary_name ?? "",
        beneficiaryCountry: standing.beneficiary_country ?? "",
        beneficiaryPostalCode: standing.beneficiary_postal_code ?? "",
        beneficiaryCity: standing.beneficiary_city ?? "",
        beneficiaryAddress1: standing.beneficiary_address1 ?? "",
        beneficiaryAddress2: standing.beneficiary_address2 ?? "",
        paymentType: "standing" as const,
        firstExecutionDate: standing.start_date,
        frequency: standing.frequency,
        weekendHolidayRule: standing.weekend_holiday_rule,
        periodType: standing.end_date == null ? ("unlimited" as const) : ("endDate" as const),
        endDate: standing.end_date ?? "",
        debitAccount: String(standing.debit_account_id),
        amount: String(Math.abs(standing.amount_cents) / 100),
        express: "no" as const,
        executionDate: syntheticOccurrence.execution_date,
        rfReference: standing.rf_reference ?? "",
        communicationToBeneficiary: standing.communication_to_beneficiary ?? "",
        accountingTextForYou: standing.accounting_text ?? "",
        debtorName: standing.debtor_name ?? "",
        debtorCountry: standing.debtor_country ?? "",
        debtorPostalCode: standing.debtor_postal_code ?? "",
        debtorCity: standing.debtor_city ?? "",
        debtorAddress1: standing.debtor_address1 ?? "",
        debtorAddress2: standing.debtor_address2 ?? "",
      };
      const debitAcc = accountById.get(standing.debit_account_id) ?? null;
      const debitAccountLabel = debitAcc
        ? `${debitAcc.identifier} (${debitAcc.name})`
        : String(standing.debit_account_id);
      body = <BankPaymentReviewSummary draft={draft} debitAccountLabel={debitAccountLabel} t={t} />;
    } else {
      body = (
        <BankFlowTransactionReviewSummary
          row={{
            id: standing.id,
            kind: "debit",
            created_at: standing.created_at,
            debit_account_id: standing.debit_account_id,
            credit_account_id: null,
            amount_cents: standing.amount_cents,
            currency: standing.currency,
            execution_date: syntheticOccurrence.execution_date,
            accounting_text: standing.accounting_text,
            beneficiary_iban: standing.beneficiary_iban,
            beneficiary_bic: standing.beneficiary_bic,
            beneficiary_name: standing.beneficiary_name,
            beneficiary_country: standing.beneficiary_country,
            beneficiary_postal_code: standing.beneficiary_postal_code,
            beneficiary_city: standing.beneficiary_city,
            beneficiary_address1: standing.beneficiary_address1,
            beneficiary_address2: standing.beneficiary_address2,
            payment_type: "standing",
            first_execution_date: standing.start_date,
            frequency: standing.frequency,
            weekend_holiday_rule: standing.weekend_holiday_rule,
            period_type: standing.end_date == null ? "unlimited" : "endDate",
            end_date: standing.end_date,
            is_express: 0,
            rf_reference: standing.rf_reference,
            communication_to_beneficiary: standing.communication_to_beneficiary,
            debtor_name: standing.debtor_name,
            debtor_country: standing.debtor_country,
            debtor_postal_code: standing.debtor_postal_code,
            debtor_city: standing.debtor_city,
            debtor_address1: standing.debtor_address1,
            debtor_address2: standing.debtor_address2,
            execution_mode: null,
            is_conditionally_visible: 0,
            counterparty_name: standing.beneficiary_name,
            counterparty_iban: standing.beneficiary_iban,
          }}
          debitAccountLabel={debitLabel}
          creditAccountLabel={null}
          t={t}
        />
      );
    }
  } else if (row?.kind === "payment") {
    const draft = transactionRowToPaymentDraft(row);
    const debitAccountId = Number(draft.debitAccount);
    const debitAcc = Number.isFinite(debitAccountId) ? (accountById.get(debitAccountId) ?? null) : null;
    const debitAccountLabel = debitAcc
      ? `${debitAcc.identifier} (${debitAcc.name})`
      : draft.debitAccount;
    body = (
      <BankPaymentReviewSummary draft={draft} debitAccountLabel={debitAccountLabel} t={t} />
    );
  } else if (row?.kind === "transfer") {
    const draft = transactionRowToTransferDraft(row);
    const dId = Number(draft.debitAccount);
    const cId = Number(draft.creditAccount);
    const debitAcc = Number.isFinite(dId) ? (accountById.get(dId) ?? null) : null;
    const creditAcc = Number.isFinite(cId) ? (accountById.get(cId) ?? null) : null;
    body = (
      <BankTransferReviewSummary
        draft={draft}
        debitAccountLabel={
          debitAcc ? `${debitAcc.identifier} (${debitAcc.name})` : draft.debitAccount
        }
        creditAccountLabel={
          creditAcc ? `${creditAcc.identifier} (${creditAcc.name})` : draft.creditAccount
        }
        t={t}
      />
    );
  } else if (
    row &&
    (row.kind === "purchaseService" ||
      row.kind === "credit" ||
      row.kind === "debit")
  ) {
    body = (
      <BankFlowTransactionReviewSummary
        row={row}
        debitAccountLabel={row.debit_account_id != null ? debitLabel : null}
        creditAccountLabel={row.credit_account_id != null ? creditLabel : null}
        t={t}
      />
    );
  } else {
    notFound();
  }

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <nav
          aria-label={t("bankNavigation.breadcrumb")}
          className="text-sm text-muted-foreground print:hidden"
        >
          <Link href="/home" className="font-medium text-primary hover:underline">
            {t("bankNavigation.wealth")}
          </Link>
          {backAccount ? (
            <>
              <span aria-hidden="true" className="mx-2">
                /
              </span>
              <Link
                href={backHref}
                className="font-medium text-primary hover:underline"
              >
                {backAccount.name}
              </Link>
            </>
          ) : null}
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankTransactionDetail.breadcrumbLeaf")}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{heading}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">
            {t("bankTransactionDetail.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("bankConfirmation.reference")} #
            {syntheticOccurrence ? syntheticOccurrence.syntheticId : row?.id}
            {" · "}
            {t("bankTransactionDetail.recordedOn")}{" "}
            <time dateTime={row?.created_at ?? syntheticOccurrence?.standingOrder.created_at}>
              {createdAt.toLocaleString(intlLocale, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </p>
        </header>

        {body}

        <div className="flex flex-wrap gap-3 print:hidden">
          <BankPrintButton label={t("bankConfirmation.actions.print")} />
          {syntheticOccurrence && showStandingSummary ? (
            <>
              <button
                type="button"
                aria-label={standingOrderActionLabel}
                title={standingOrderActionLabel}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-card-border bg-muted px-5 py-2.5 text-base font-medium text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
              >
                {syntheticOccurrence.standingOrder.is_active === 1 ? (
                  <Pause className="h-5 w-5" aria-hidden />
                ) : (
                  <Play className="h-5 w-5" aria-hidden />
                )}
                {standingOrderActionLabel}
              </button>
              <form action={deleteStandingOrderAction}>
                <input
                  type="hidden"
                  name="standingOrderId"
                  value={String(syntheticOccurrence.standingOrder.id)}
                />
                <input
                  type="hidden"
                  name="fromAccount"
                  value={backAccount ? String(backAccount.id) : ""}
                />
                <ConfirmableDeleteStandingOrderButton
                  label={t("bankTransactionDetail.actions.deleteStandingOrder")}
                  confirmMessage={t("bankTransactionDetail.actions.deleteStandingOrderConfirm")}
                />
              </form>
            </>
          ) : null}
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-card-border bg-muted px-5 py-2.5 text-base font-medium text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            {backLabel}
          </Link>
        </div>
      </main>
    </Container>
  );
}
