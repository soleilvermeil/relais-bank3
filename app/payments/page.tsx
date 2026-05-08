import Link from "next/link";
import { Landmark, QrCode, Repeat } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";
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

        <section className="space-y-4">
          <SectionTitle as="h2">{t("bankPaymentsLanding.mainActionsTitle")}</SectionTitle>
          <div className="grid auto-rows-fr gap-3 rounded-2xl border border-card-border bg-card p-4 sm:grid-cols-3 sm:p-6">
            <Link
              href="/make-payment"
              className="grid h-full w-full grid-cols-[auto_1fr] items-start gap-4 rounded-2xl border border-card-border bg-muted p-4 text-left text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Landmark className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex h-full flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">
                  {t("bankPaymentsLanding.cards.paymentTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("bankPaymentsLanding.cards.paymentDescription")}
                </p>
              </div>
            </Link>

            <Link
              href="/make-transfer"
              className="grid h-full w-full grid-cols-[auto_1fr] items-start gap-4 rounded-2xl border border-card-border bg-muted p-4 text-left text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Repeat className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex h-full flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">
                  {t("bankPaymentsLanding.cards.transferTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("bankPaymentsLanding.cards.transferDescription")}
                </p>
              </div>
            </Link>

            <Link
              href="/scan-qr"
              className="grid h-full w-full grid-cols-[auto_1fr] items-start gap-4 rounded-2xl border border-card-border bg-muted p-4 text-left text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <QrCode className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex h-full flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">
                  {t("bankPaymentsLanding.cards.scanTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("bankPaymentsLanding.cards.scanDescription")}
                </p>
              </div>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle as="h2">{t("bankPaymentsLanding.comingSoonTitle")}</SectionTitle>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">{t("bankPaymentsLanding.comingSoonBody")}</p>
          </div>
        </section>
      </main>
    </Container>
  );
}
