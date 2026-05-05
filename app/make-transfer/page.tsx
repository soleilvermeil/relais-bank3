import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { BankTransferForm } from "@/components/organisms/bank-transfer-form";

export default async function MakeTransferPage() {
  const t = await getServerT();

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
          <span className="text-foreground">{t("bankNavigation.makeTransfer")}</span>
        </nav>
        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankTransfer.title")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">{t("bankTransfer.subtitle")}</p>
        </header>
        <BankTransferForm />
      </main>
    </Container>
  );
}
