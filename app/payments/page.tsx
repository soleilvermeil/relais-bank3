import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";

export default async function PaymentsPage() {
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

        <section className="grid gap-4 rounded-2xl border border-card-border bg-card p-4 sm:grid-cols-2 sm:p-6">
          <article className="space-y-3 rounded-2xl border border-card-border p-4">
            <h2 className="text-lg font-semibold text-foreground">
              {t("bankPaymentsLanding.cards.paymentTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("bankPaymentsLanding.cards.paymentDescription")}
            </p>
            <Link href="/make-payment" className="inline-flex">
              <Button>{t("bankPaymentsLanding.cards.paymentCta")}</Button>
            </Link>
          </article>
          <article className="space-y-3 rounded-2xl border border-card-border p-4">
            <h2 className="text-lg font-semibold text-foreground">
              {t("bankPaymentsLanding.cards.transferTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("bankPaymentsLanding.cards.transferDescription")}
            </p>
            <Link href="/make-transfer" className="inline-flex">
              <Button>{t("bankPaymentsLanding.cards.transferCta")}</Button>
            </Link>
          </article>
        </section>
      </main>
    </Container>
  );
}
