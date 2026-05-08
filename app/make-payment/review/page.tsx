import Link from "next/link";
import { redirect } from "next/navigation";
import { confirmPayment } from "@/app/actions/bank";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { BankPaymentReviewSummary } from "@/components/organisms/bank-review-summary";
import { getCurrentUserId, readPaymentDraftCookie } from "@/lib/bank-cookies";
import { listSelectableAccounts, localizeAccounts } from "@/lib/db/accounts";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function MakePaymentReviewPage() {
  const draft = await readPaymentDraftCookie();
  if (!draft) {
    redirect("/make-payment");
  }

  const userId = await getCurrentUserId();
  if (userId == null) {
    redirect("/");
  }

  const t = await getServerT();
  const selectableAccounts = localizeAccounts(await listSelectableAccounts(userId), t);
  const accountById = new Map(selectableAccounts.map((account) => [account.id, account]));

  const debitAccountId = Number(draft.debitAccount);
  const debitAccount = Number.isFinite(debitAccountId)
    ? (accountById.get(debitAccountId) ?? null)
    : null;
  const debitAccountLabel = debitAccount
    ? `${debitAccount.identifier} (${debitAccount.name})`
    : draft.debitAccount;

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
          <Link href="/make-payment" className="font-medium text-primary hover:underline">
            {t("bankNavigation.makePayment")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankReview.title")}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankReview.titlePayment")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">
            {t("bankReview.subtitle")}
          </p>
        </header>

        <BankPaymentReviewSummary
          draft={draft}
          debitAccountLabel={debitAccountLabel}
          t={t}
        />

        <div className="flex flex-wrap gap-3 print:hidden">
          <form action={confirmPayment}>
            <Button type="submit" wide>
              {t("bankReview.actions.confirm")}
            </Button>
          </form>
          <Link href="/make-payment" className="inline-flex">
            <Button variant="secondary">{t("bankReview.actions.edit")}</Button>
          </Link>
        </div>
      </main>
    </Container>
  );
}
