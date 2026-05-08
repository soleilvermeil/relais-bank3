import Link from "next/link";
import { redirect } from "next/navigation";
import { dismissTransferConfirmation } from "@/app/actions/bank";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { BankTransferReviewSummary } from "@/components/organisms/bank-review-summary";
import { BankPrintButton } from "@/components/molecules/bank-print-button";
import { getCurrentUserId, readLastTransferCookie } from "@/lib/bank-cookies";
import { listSelectableAccounts, localizeAccounts } from "@/lib/db/accounts";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function MakeTransferConfirmationPage() {
  const snapshot = await readLastTransferCookie();
  if (!snapshot) {
    redirect("/make-transfer");
  }

  const userId = await getCurrentUserId();
  if (userId == null) {
    redirect("/");
  }

  const t = await getServerT();
  const intlLocale = await getIntlLocale();
  const selectableAccounts = localizeAccounts(listSelectableAccounts(userId), t);
  const accountById = new Map(selectableAccounts.map((account) => [account.id, account]));

  const debitAccountId = Number(snapshot.debitAccount);
  const creditAccountId = Number(snapshot.creditAccount);
  const debitAccount = Number.isFinite(debitAccountId)
    ? (accountById.get(debitAccountId) ?? null)
    : null;
  const creditAccount = Number.isFinite(creditAccountId)
    ? (accountById.get(creditAccountId) ?? null)
    : null;
  const debitAccountLabel = debitAccount
    ? `${debitAccount.identifier} (${debitAccount.name})`
    : snapshot.debitAccount;
  const creditAccountLabel = creditAccount
    ? `${creditAccount.identifier} (${creditAccount.name})`
    : snapshot.creditAccount;

  const placedAt = new Date(snapshot.placedAt);

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
          <Link href="/make-transfer" className="font-medium text-primary hover:underline">
            {t("bankNavigation.makeTransfer")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankConfirmation.title")}</span>
        </nav>

        <header className="space-y-3">
          <p className="text-4xl text-primary" aria-hidden="true">
            ✓
          </p>
          <SectionTitle as="h1">{t("bankConfirmation.titleTransfer")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">
            {t("bankConfirmation.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("bankConfirmation.placedOn")}{" "}
            <time dateTime={snapshot.placedAt}>
              {placedAt.toLocaleString(intlLocale, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
            {" · "}
            {t("bankConfirmation.reference")} #{snapshot.transactionId}
          </p>
        </header>

        <BankTransferReviewSummary
          draft={snapshot}
          debitAccountLabel={debitAccountLabel}
          creditAccountLabel={creditAccountLabel}
          t={t}
        />

        <div className="flex flex-wrap gap-3 print:hidden">
          <BankPrintButton label={t("bankConfirmation.actions.print")} />
          <form action={dismissTransferConfirmation}>
            <Button type="submit">
              {t("bankConfirmation.actions.makeAnotherTransfer")}
            </Button>
          </form>
        </div>
      </main>
    </Container>
  );
}
