import { getServerT } from "@/lib/i18n/server";
import { formatChfCurrency } from "@/lib/bank-money";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { WealthAccountSection } from "@/components/organisms/wealth-account-section";
import { fakeLoginAction } from "@/app/actions/auth";
import { isUserConnectedFromCookie } from "@/lib/bank-cookies";
import {
  listAccountsGroupedByCategory,
  localizeAccountGroups,
  type AccountCategory,
} from "@/lib/db/accounts";

const SECTION_TITLE_KEY: Record<AccountCategory, string> = {
  checking: "bankWealth.sections.checking",
  savings: "bankWealth.sections.savings",
  retirement: "bankWealth.sections.retirement",
  cards: "bankWealth.sections.cards",
};

export const dynamic = "force-dynamic";

export default async function WealthPage() {
  const t = await getServerT();
  const isConnected = await isUserConnectedFromCookie();
  if (!isConnected) {
    return (
      <Container>
        <main id="main-content" className="py-8">
          <section className="mx-auto w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-sm">
            <header className="mb-5 space-y-2">
              <SectionTitle as="h1">{t("bankFakeLogin.title")}</SectionTitle>
              <p className="text-sm text-muted-foreground">{t("bankFakeLogin.subtitle")}</p>
            </header>
            <form action={fakeLoginAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="contractNumber" className="block text-sm font-medium text-foreground">
                  {t("bankFakeLogin.fields.contractNumber")}
                </label>
                <Input id="contractNumber" name="contractNumber" autoComplete="username" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  {t("bankFakeLogin.fields.password")}
                </label>
                <Input id="password" name="password" type="password" autoComplete="current-password" />
              </div>
              <p className="text-xs text-muted-foreground">{t("bankFakeLogin.hint")}</p>
              <Button type="submit" wide>
                {t("bankFakeLogin.actions.connect")}
              </Button>
            </form>
          </section>
        </main>
      </Container>
    );
  }

  return <ConnectedWealthContent />;
}

async function ConnectedWealthContent() {
  const t = await getServerT();
  const groups = localizeAccountGroups(listAccountsGroupedByCategory(), t);

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankWealth.title")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">{t("bankWealth.subtitle")}</p>
        </header>

        <div className="space-y-6">
          {groups.map((group) => (
            <WealthAccountSection
              key={group.category}
              title={t(SECTION_TITLE_KEY[group.category])}
              accounts={group.accounts.map((account) => ({
                id: account.id,
                name: account.name,
                identifier: account.identifier,
                balance: account.balance,
              }))}
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
