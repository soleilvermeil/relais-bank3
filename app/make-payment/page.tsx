import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { BankPaymentForm } from "@/components/organisms/bank-payment-form";
import { listSelectableAccounts } from "@/lib/db/accounts";

export const dynamic = "force-dynamic";

export default async function MakePaymentPage() {
  const t = await getServerT();
  const debitAccounts = listSelectableAccounts().map((account) => ({
    id: account.id,
    label: `${account.identifier} (${account.name})`,
  }));

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <nav aria-label={t("bankNavigation.breadcrumb")} className="text-sm text-muted-foreground">
          <Link href="/payments" className="font-medium text-primary hover:underline">
            {t("bankNavigation.payments")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankNavigation.makePayment")}</span>
        </nav>
        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankPayment.title")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">{t("bankPayment.subtitle")}</p>
        </header>
        <BankPaymentForm debitAccounts={debitAccounts} />
      </main>
    </Container>
  );
}
