import { getServerT } from "@/lib/i18n/server";
import { formatChfCurrency } from "@/lib/bank-money";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { WealthAccountSection } from "@/components/organisms/wealth-account-section";
import { BankLoginForm } from "@/components/organisms/bank-login-form";
import { getCurrentUserId } from "@/lib/bank-cookies";
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
  const userId = await getCurrentUserId();
  if (userId == null) {
    return (
      <Container>
        <BankLoginForm />
      </Container>
    );
  }

  return <ConnectedWealthContent userId={userId} />;
}

async function ConnectedWealthContent({ userId }: { userId: number }) {
  const t = await getServerT();
  const groups = localizeAccountGroups(await listAccountsGroupedByCategory(userId), t);

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
