import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";

export default async function HomePage() {
  const t = await getServerT();

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankPaymentsLanding.title")}</SectionTitle>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t("bankPaymentsLanding.subtitle")}
          </p>
        </header>
        <section className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/payments" className="inline-flex">
              <Button>{t("bankNavigation.payments")}</Button>
            </Link>
            <Link href="/make-payment" className="inline-flex">
              <Button variant="secondary">{t("bankNavigation.makePayment")}</Button>
            </Link>
            <Link href="/make-transfer" className="inline-flex">
              <Button variant="secondary">{t("bankNavigation.makeTransfer")}</Button>
            </Link>
          </div>
        </section>
      </main>
    </Container>
  );
}
