import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";

type Account = {
  name: string;
  identifier: string;
  balance: number;
};

type AccountSection = {
  title: string;
  accounts: Account[];
};

const currency = new Intl.NumberFormat("en-CH", {
  style: "currency",
  currency: "CHF",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(amount: number): string {
  if (amount < 0) {
    return `-${currency.format(Math.abs(amount))}`;
  }
  return currency.format(amount);
}

function sectionTotal(accounts: Account[]): number {
  return accounts.reduce((sum, account) => sum + account.balance, 0);
}

export default async function WealthPage() {
  const t = await getServerT();

  const sections: AccountSection[] = [
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
        {
          name: `${t("bankWealth.accountLabels.savings")} 02`,
          identifier: "CH10 8080 8000 3333 4444 5",
          balance: 15750.8,
        },
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
            <section key={section.title} className="space-y-4">
              <SectionTitle as="h2">{section.title}</SectionTitle>
              <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
                <div>
                  {section.accounts.map((account, index) => {
                    return (
                      <article
                        key={`${section.title}-${account.identifier}`}
                        className={index > 0 ? "mt-3 border-t border-card-border pt-3" : ""}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-base font-semibold text-foreground">{account.name}</h3>
                            <p className="text-sm text-muted-foreground">{account.identifier}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <p
                              className={`text-sm font-semibold ${
                                account.balance < 0 ? "text-red-600" : "text-foreground"
                              }`}
                            >
                              {formatCurrency(account.balance)}
                            </p>
                            <div className="hidden sm:block">
                              <Button variant="secondary">{t("bankWealth.actions.details")}</Button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-card-border pt-3">
                  <p className="flex items-center justify-between text-sm sm:text-base">
                    <span className="font-medium text-foreground">
                      {t("bankWealth.labels.totalByCategory")}
                    </span>
                    <span
                      className={`font-semibold ${
                        sectionTotal(section.accounts) < 0 ? "text-red-600" : "text-foreground"
                      }`}
                    >
                      {formatCurrency(sectionTotal(section.accounts))}
                    </span>
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </Container>
  );
}
