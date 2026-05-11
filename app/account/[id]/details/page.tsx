import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { BankCardVisual } from "@/components/molecules/bank-card-visual";
import { getServerT } from "@/lib/i18n/server";
import { getCurrentUserId } from "@/lib/bank-cookies";
import {
  getAccountById,
  listAccountsGroupedByCategory,
  localizeAccountGroups,
} from "@/lib/db/accounts";
import { getCardForAccount } from "@/lib/db/cards";
import { getProfileByUserId } from "@/lib/db/profile";

export const dynamic = "force-dynamic";

export default async function AccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountId = Number(id);
  if (!Number.isFinite(accountId) || accountId <= 0) {
    notFound();
  }

  const userId = await getCurrentUserId();
  if (userId == null) {
    redirect("/");
  }

  const baseAccount = await getAccountById(userId, accountId);
  if (!baseAccount) {
    notFound();
  }

  const t = await getServerT();
  const localizedGroups = localizeAccountGroups(
    await listAccountsGroupedByCategory(userId),
    t,
  );
  const account = localizedGroups
    .flatMap((group) => group.accounts)
    .find((entry) => entry.id === baseAccount.id) ?? baseAccount;

  const showsCard = account.category === "checking" || account.category === "cards";
  const card = showsCard ? await getCardForAccount(userId, account.id) : null;
  const userProfile = await getProfileByUserId(userId);
  const holderFirstName =
    userProfile?.first_name ?? t("bankAccountDetail.card.holderFirstName");
  const holderLastName = userProfile?.last_name ?? t("bankAccountDetail.card.holderLastName");

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <nav
          aria-label={t("bankNavigation.breadcrumb")}
          className="text-sm text-muted-foreground"
        >
          <Link href="/" className="font-medium text-primary hover:underline">
            {t("bankNavigation.wealth")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <Link
            href={`/account/${account.id}`}
            className="font-medium text-primary hover:underline"
          >
            {account.name}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">
            {t("bankAccountDetail.breadcrumbLeaf")}
          </span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{account.name}</SectionTitle>
          <p className="text-sm text-muted-foreground">{account.identifier}</p>
        </header>

        {showsCard && card ? (
          <section className="space-y-4">
            <SectionTitle as="h2">{t("bankAccountDetail.sections.card")}</SectionTitle>
            <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
              <BankCardVisual
                pan={card.pan}
                expiryMonth={card.expiryMonth}
                expiryYear={card.expiryYear}
                cvv={card.cvv}
                brand={card.brand}
                cardType={card.cardType}
                holderFirstName={holderFirstName}
                holderLastName={holderLastName}
                labels={{
                  reveal: t("bankAccountDetail.card.reveal"),
                  hide: t("bankAccountDetail.card.hide"),
                  expiry: t("bankAccountDetail.card.expiry"),
                  cvv: t("bankAccountDetail.card.cvv"),
                  cardholder: t("bankAccountDetail.card.cardholder"),
                  debit: t("bankAccountDetail.card.debit"),
                  credit: t("bankAccountDetail.card.credit"),
                }}
              />
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <SectionTitle as="h2">
            {t("bankAccountDetail.comingSoon.title")}
          </SectionTitle>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              {t("bankAccountDetail.comingSoon.body")}
            </p>
          </div>
        </section>
      </main>
    </Container>
  );
}
