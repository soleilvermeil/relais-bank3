import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BankFlowTransactionReviewSummary,
  BankPaymentReviewSummary,
  BankTransferReviewSummary,
} from "@/components/organisms/bank-review-summary";
import { BankPrintButton } from "@/components/molecules/bank-print-button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import {
  transactionRowToPaymentDraft,
  transactionRowToTransferDraft,
} from "@/lib/bank-transaction-mappers";
import { getAccountById } from "@/lib/db/accounts";
import { getTransactionById } from "@/lib/db/transactions";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function accountLabel(id: number | null): string {
  if (id == null) return "";
  const acc = getAccountById(id);
  return acc ? `${acc.identifier} (${acc.name})` : `#${id}`;
}

export default async function WealthTransactionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromAccount?: string }>;
}) {
  const { id: idRaw } = await params;
  const { fromAccount: fromRaw } = await searchParams;
  const txId = Number(idRaw);
  if (!Number.isFinite(txId) || txId <= 0) {
    notFound();
  }

  const row = getTransactionById(txId);
  if (!row) {
    notFound();
  }

  const fromAccountId = fromRaw != null ? Number(fromRaw) : NaN;
  const backAccount =
    Number.isFinite(fromAccountId) && fromAccountId > 0
      ? getAccountById(fromAccountId)
      : null;

  const t = await getServerT();
  const intlLocale = await getIntlLocale();
  const createdAt = new Date(row.created_at);

  const debitLabel = accountLabel(row.debit_account_id);
  const creditLabel = accountLabel(row.credit_account_id);

  const backHref = backAccount ? `/home/account/${backAccount.id}` : "/home";
  const backLabel = backAccount
    ? t("bankTransactionDetail.backToAccount")
    : t("bankTransactionDetail.backToWealth");

  const titlePayment = t("bankReview.titlePayment");
  const titleTransfer = t("bankReview.titleTransfer");
  let heading = t("bankTransactionDetail.titleFallback");
  if (row.kind === "payment") {
    heading = titlePayment;
  } else if (row.kind === "transfer") {
    heading = titleTransfer;
  }

  let body: ReactElement | null = null;

  if (row.kind === "payment") {
    const draft = transactionRowToPaymentDraft(row);
    const debitAccountId = Number(draft.debitAccount);
    const debitAcc = Number.isFinite(debitAccountId) ? getAccountById(debitAccountId) : null;
    const debitAccountLabel = debitAcc
      ? `${debitAcc.identifier} (${debitAcc.name})`
      : draft.debitAccount;
    body = (
      <BankPaymentReviewSummary draft={draft} debitAccountLabel={debitAccountLabel} t={t} />
    );
  } else if (row.kind === "transfer") {
    const draft = transactionRowToTransferDraft(row);
    const dId = Number(draft.debitAccount);
    const cId = Number(draft.creditAccount);
    const debitAcc = Number.isFinite(dId) ? getAccountById(dId) : null;
    const creditAcc = Number.isFinite(cId) ? getAccountById(cId) : null;
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
    row.kind === "purchaseService" ||
    row.kind === "credit" ||
    row.kind === "debit"
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
          <Link href="/payments" className="font-medium text-primary hover:underline">
            {t("bankNavigation.payments")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
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
            {t("bankConfirmation.reference")} #{row.id}
            {" · "}
            {t("bankTransactionDetail.recordedOn")}{" "}
            <time dateTime={row.created_at}>
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
