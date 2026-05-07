import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { QrBillScanner } from "@/components/organisms/qr-bill-scanner";

export default async function ScanQrPage() {
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
          <span className="text-foreground">{t("bankNavigation.scanQr")}</span>
        </nav>
        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankScanQr.title")}</SectionTitle>
          <p className="max-w-2xl text-base text-muted-foreground">{t("bankScanQr.subtitle")}</p>
        </header>
        <section className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <QrBillScanner />
        </section>
      </main>
    </Container>
  );
}
