import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { TFunction } from "i18next";
import { getServerT } from "@/lib/i18n/server";
import { formatChfCurrency } from "@/lib/bank-money";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { listAccountsGroupedByCategory, localizeAccountGroups } from "@/lib/db/accounts";
import {
  listTransactionsForAccount,
  type Transaction,
} from "@/lib/db/transactions";
import { getCurrentUserId } from "@/lib/bank-cookies";

export const dynamic = "force-dynamic";

type TransactionsByDate = {
  date: string;
  items: Transaction[];
};

type UpcomingType = "pending" | "standing";

type TransactionsByType = {
  type: UpcomingType;
  items: Transaction[];
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year.slice(-2)}`;
}

function transactionLabel(
  transaction: Transaction,
  accountNameById: Map<number, string>,
  t: TFunction,
): string {
  if (transaction.kind === "purchaseService") {
    return t("bankAccountDetail.transactionLabels.purchaseService", {
      date: formatShortDate(transaction.execution_date ?? ""),
      counterparty: transaction.counterparty_name ?? "",
    });
  }
  if (transaction.kind === "debit") {
    return t("bankAccountDetail.transactionLabels.debitTo", {
      target: transaction.counterparty_name ?? "",
    });
  }
  if (transaction.kind === "credit") {
    const source =
      transaction.counterparty_name?.trim() ||
      t("bankAccountDetail.transactionLabels.incomingPaymentFallback");
    return t("bankAccountDetail.transactionLabels.creditFrom", {
      source,
    });
  }
  if (transaction.kind === "payment") {
    const target =
      transaction.beneficiary_name ??
      transaction.communication_to_beneficiary ??
      transaction.accounting_text ??
      "";
    return target.trim() === ""
      ? t("bankAccountDetail.transactionLabels.debitToPaymentBeneficiary")
      : t("bankAccountDetail.transactionLabels.debitTo", { target });
  }
  const transferCounterpartyAccountId =
    transaction.amount > 0 ? transaction.debit_account_id : transaction.credit_account_id;
  const transferTarget =
    transferCounterpartyAccountId != null
      ? (accountNameById.get(transferCounterpartyAccountId) ??
        t("bankAccountDetail.transactionLabels.ownAccount"))
      : t("bankAccountDetail.transactionLabels.ownAccount");
  return transaction.amount > 0
    ? t("bankAccountDetail.transactionLabels.creditFrom", { source: transferTarget })
    : t("bankAccountDetail.transactionLabels.debitTo", { target: transferTarget });
}

function upcomingDescription(transaction: Transaction, t: TFunction): string {
  return (
    transaction.accounting_text ??
    transaction.beneficiary_name ??
    transaction.communication_to_beneficiary ??
    t("bankAccountDetail.transactionLabels.scheduledOrder")
  );
}

function upcomingType(transaction: Transaction): UpcomingType {
  return transaction.payment_type === "standing" ? "standing" : "pending";
}

function standingOrderIdFromSynthetic(txId: number | string): string | null {
  if (typeof txId !== "string") return null;
  const [prefix, standingOrderId] = txId.split(":");
  if (prefix !== "so" || !standingOrderId) return null;
  return standingOrderId;
}

const txDetailLinkClass =
  "font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function groupByDate(transactions: Transaction[]): TransactionsByDate[] {
  return transactions.reduce<TransactionsByDate[]>((groups, transaction) => {
    const date = transaction.execution_date ?? "";
    const currentGroup = groups.at(-1);
    if (!currentGroup || currentGroup.date !== date) {
      groups.push({ date, items: [transaction] });
      return groups;
    }
    currentGroup.items.push(transaction);
    return groups;
  }, []);
}

function groupUpcomingByType(transactions: Transaction[]): TransactionsByType[] {
  const pending = transactions.filter((transaction) => upcomingType(transaction) === "pending");
  const standing = transactions.filter((transaction) => upcomingType(transaction) === "standing");
  const groups: TransactionsByType[] = [];
  if (pending.length > 0) groups.push({ type: "pending", items: pending });
  if (standing.length > 0) groups.push({ type: "standing", items: standing });
  return groups;
}

export default async function AccountDetailPage({
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

  const t = await getServerT();
  const localizedGroups = localizeAccountGroups(listAccountsGroupedByCategory(userId), t);
  const localizedAccounts = localizedGroups.flatMap((group) => group.accounts);
  const accountById = new Map(localizedAccounts.map((account) => [account.id, account]));
  const accountNameById = new Map(localizedAccounts.map((account) => [account.id, account.name]));
  const account = accountById.get(accountId);
  if (!account) {
    notFound();
  }
  const today = todayIsoDate();
  const allTransactions = listTransactionsForAccount(account.id, userId);

  const rawUpcomingOrders = allTransactions
    .filter((tx) => (tx.execution_date ?? "") > today)
    .sort((a, b) => (a.execution_date ?? "").localeCompare(b.execution_date ?? ""));
  const seenStandingOrderIds = new Set<string>();
  const upcomingOrders = rawUpcomingOrders.filter((tx) => {
    if (upcomingType(tx) !== "standing") return true;
    const standingOrderId = standingOrderIdFromSynthetic(tx.id);
    if (!standingOrderId) return true;
    if (seenStandingOrderIds.has(standingOrderId)) return false;
    seenStandingOrderIds.add(standingOrderId);
    return true;
  });

  const pastTransactions = allTransactions
    .filter((tx) => (tx.execution_date ?? "") <= today)
    .sort((a, b) => (b.execution_date ?? "").localeCompare(a.execution_date ?? ""));

  const pastTransactionsByDate = groupByDate(pastTransactions);
  const upcomingOrdersByType = groupUpcomingByType(upcomingOrders);

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <nav aria-label={t("bankNavigation.breadcrumb")} className="text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary hover:underline">
            {t("bankNavigation.wealth")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{account.name}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{account.name}</SectionTitle>
          <p className="text-sm text-muted-foreground">{account.identifier}</p>
          <p className="max-w-3xl text-base text-muted-foreground">
            {t("bankAccountDetail.subtitle")}
          </p>
        </header>

        <section className="space-y-4">
          <SectionTitle as="h2">{t("bankAccountDetail.sections.upcomingOrders")}</SectionTitle>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
            <div className="grid gap-4">
              {upcomingOrdersByType.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("bankAccountDetail.sections.upcomingOrders")} —
                </p>
              ) : (
                upcomingOrdersByType.map((group) => (
                  <article key={group.type}>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {group.type === "pending"
                        ? t("bankAccountDetail.types.pending")
                        : t("bankAccountDetail.types.standing")}
                    </p>
                    <div className="space-y-3 border-t border-card-border pt-3">
                      {group.items.map((order) => {
                        const standingSummaryId =
                          group.type === "standing" ? standingOrderIdFromSynthetic(order.id) : null;
                        const transactionPath =
                          standingSummaryId != null
                            ? `/transaction/so:${standingSummaryId}`
                            : `/transaction/${encodeURIComponent(String(order.id))}`;
                        return (
                          <div key={order.id} className="grid grid-cols-[1fr_auto] items-start gap-4">
                            <div className="space-y-1">
                              <p className="text-base font-medium">
                                <Link
                                  href={`${transactionPath}?fromAccount=${account.id}`}
                                  className={txDetailLinkClass}
                                >
                                  {upcomingDescription(order, t)}
                                </Link>
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {formatChfCurrency(order.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle as="h2">{t("bankAccountDetail.sections.pastTransactions")}</SectionTitle>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
            <div className="grid gap-4">
              {pastTransactionsByDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                pastTransactionsByDate.map((group) => (
                  <article key={group.date}>
                    <p className="mb-1 text-xs text-muted-foreground">{group.date}</p>
                    <div className="space-y-3 border-t border-card-border pt-3">
                      {group.items.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="grid grid-cols-[1fr_auto] items-start gap-4"
                        >
                          <div className="space-y-1">
                            <p className="text-base font-medium">
                              <Link
                                href={`/transaction/${encodeURIComponent(String(transaction.id))}?fromAccount=${account.id}`}
                                className={txDetailLinkClass}
                              >
                                {transactionLabel(transaction, accountNameById, t)}
                              </Link>
                            </p>
                          </div>
                          <p
                            className={`text-sm font-semibold ${
                              transaction.amount > 0 ? "text-green-500" : "text-foreground"
                            }`}
                          >
                            {formatChfCurrency(transaction.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </Container>
  );
}
