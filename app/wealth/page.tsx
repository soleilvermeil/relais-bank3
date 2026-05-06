import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { formatChfCurrency } from "@/lib/bank-money";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import {
  WealthAccountSection,
  type WealthAccount,
} from "@/components/organisms/wealth-account-section";

type WealthPageSection = {
  title: string;
  accounts: WealthAccount[];
};

export default async function WealthPage() {
  const t = await getServerT();

  const sections: WealthPageSection[] = [
    {
      title: t("bankWealth.sections.checking"),
      accounts: [
        {
          name: `${t("bankWealth.accountLabels.checking")} 01`,
          identifier: "CH14 8080 8001 2345 6789 0",
          balance: 12580.45,
        },
        {
          name: `${t("bankWealth.accountLabels.checking")} 02`,
          identifier: "CH77 8080 8009 9999 0000 1",
          balance: 3420.0,
        },
        {
          name: `${t("bankWealth.accountLabels.checking")} 02`,
          identifier: "CH77 8080 8009 9999 0000 2",
          balance: -82.50,
        },
      ],
    },
    {
      title: t("bankWealth.sections.savings"),
      accounts: [
        {
          name: `${t("bankWealth.accountLabels.savings")} 01`,
          identifier: "CH93 8080 8000 1111 2222 3",
          balance: 48200.0,
        },
        // {
        //   name: `${t("bankWealth.accountLabels.savings")} 02`,
        //   identifier: "CH10 8080 8000 3333 4444 5",
        //   balance: 15750.8,
        // },
      ],
    },
    {
      title: t("bankWealth.sections.retirement"),
      accounts: [
        {
          name: `${t("bankWealth.accountLabels.retirement")} A`,
          identifier: "PIL-3A-001928",
          balance: 71230.15,
        },
        {
          name: `${t("bankWealth.accountLabels.retirement")} B`,
          identifier: "PEN-3B-004201",
          balance: 22890.0,
        },
      ],
    },
    {
      title: t("bankWealth.sections.cards"),
      accounts: [
        {
          name: `${t("bankWealth.accountLabels.card")} Platinum`,
          identifier: "XXXX XXXX XXXX 1284",
          balance: -980.35,
        },
        {
          name: `${t("bankWealth.accountLabels.card")} Travel`,
          identifier: "XXXX XXXX XXXX 7741",
          balance: -120.0,
        },
      ],
    },
  ];

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
          <span className="text-foreground">{t("bankNavigation.wealth")}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankWealth.title")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">{t("bankWealth.subtitle")}</p>
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <WealthAccountSection
              key={section.title}
              title={section.title}
              accounts={section.accounts}
              totalLabel={t("bankWealth.labels.totalByCategory")}
              detailsLabel={t("bankWealth.actions.details")}
              formatCurrency={formatChfCurrency}
            />
          ))}
        </div>
      </main>
    </Container>
  );
}
