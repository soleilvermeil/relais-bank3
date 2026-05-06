import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { formatChfCurrency } from "@/lib/bank-money";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";

type UpcomingOrder = {
  date: string;
  description: string;
  type: "pending" | "standing";
  amount: number;
};

type PastTransaction = {
  date: string;
  amount: number;
  kind: "purchaseService" | "debit" | "credit";
  counterpartyName: string;
  counterpartyIban: string;
};

type TransactionsByDate = {
  date: string;
  items: PastTransaction[];
};

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year.slice(-2)}`;
}

function transactionLabel(transaction: PastTransaction): string {
  if (transaction.kind === "purchaseService") {
    return `Purchase/Service on ${formatShortDate(transaction.date)}, ${transaction.counterpartyName}`;
  }
  if (transaction.kind === "debit") {
    return `Debit to ${transaction.counterpartyName}`;
  }
  return `Credit from ${transaction.counterpartyName}`;
}

export default async function AccountDetailPage() {
  const t = await getServerT();

  const upcomingOrders: UpcomingOrder[] = [
    {
      date: "2026-05-10",
      description: "Electricity bill - Romande Energie",
      type: "pending",
      amount: -145.2,
    },
    {
      date: "2026-05-18",
      description: "Monthly rent transfer",
      type: "standing",
      amount: -1850.0,
    },
    {
      date: "2026-05-29",
      description: "Mobile plan - Swisscom",
      type: "standing",
      amount: -79.9,
    },
  ];

  const pastTransactions = ([
    {
      date: "2026-04-02",
      amount: 6200.0,
      kind: "credit",
      counterpartyName: "Acme SA",
      counterpartyIban: "CH22 1111 2222 3333 4444 5",
    },
    {
      date: "2026-04-28",
      amount: -124.85,
      kind: "purchaseService",
      counterpartyName: "Migros Sevelin",
      counterpartyIban: "CH47 0000 0000 0000 1200 8",
    },
    {
      date: "2026-04-28",
      kind: "purchaseService",
      amount: -42.3,
      counterpartyName: "Sun Store",
      counterpartyIban: "CH79 0000 0000 0000 5500 1",
    },
    {
      date: "2026-04-11",
      amount: 500.0,
      kind: "credit",
      counterpartyName: "Savings account transfer",
      counterpartyIban: "CH93 8080 8000 1111 2222 3",
    },
    {
      date: "2026-04-30",
      amount: -18.5,
      kind: "purchaseService",
      counterpartyName: "Streamly",
      counterpartyIban: "CH73 0000 0000 0000 8899 2",
    },
    {
      date: "2026-04-30",
      amount: 68.4,
      kind: "credit",
      counterpartyName: "BlueShop SA",
      counterpartyIban: "CH63 0000 0000 0000 1122 9",
    },
    {
      date: "2026-04-02",
      amount: 120.0,
      kind: "credit",
      counterpartyName: "LunchPass",
      counterpartyIban: "CH51 0000 0000 0000 9988 7",
    },
    {
      date: "2026-04-24",
      amount: -320.0,
      kind: "debit",
      counterpartyName: "Martin, Elise",
      counterpartyIban: "CH19 4444 5555 6666 7777 8",
    },
  ] satisfies PastTransaction[]).sort((a, b) => b.date.localeCompare(a.date));

  const pastTransactionsByDate: TransactionsByDate[] = pastTransactions.reduce(
    (groups: TransactionsByDate[], transaction) => {
      const currentGroup = groups.at(-1);
      if (!currentGroup || currentGroup.date !== transaction.date) {
        groups.push({ date: transaction.date, items: [transaction] });
        return groups;
      }
      currentGroup.items.push(transaction);
      return groups;
    },
    [],
  );

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
          <Link href="/wealth" className="font-medium text-primary hover:underline">
            {t("bankNavigation.wealth")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankAccountDetail.title")}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankAccountDetail.title")}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">{t("bankAccountDetail.subtitle")}</p>
        </header>

        <section className="space-y-4">
          <SectionTitle as="h2">{t("bankAccountDetail.sections.upcomingOrders")}</SectionTitle>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
            <div className="grid gap-4">
              {upcomingOrders.map((order) => (
                <article key={`${order.date}-${order.description}`}>
                  <p className="mb-1 text-xs text-muted-foreground">{order.date}</p>
                  <div className="border-t border-card-border pt-3">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-base font-medium text-foreground">{order.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.type === "pending"
                          ? t("bankAccountDetail.types.pending")
                          : t("bankAccountDetail.types.standing")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatChfCurrency(order.amount)}</p>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle as="h2">{t("bankAccountDetail.sections.pastTransactions")}</SectionTitle>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
            <div className="grid gap-4">
              {pastTransactionsByDate.map((group) => (
                <article key={group.date}>
                  <p className="mb-1 text-xs text-muted-foreground">{group.date}</p>
                  <div className="space-y-3 border-t border-card-border pt-3">
                    {group.items.map((transaction) => (
                      <div
                        key={`${transaction.date}-${transaction.counterpartyName}-${transaction.amount}`}
                        className="grid grid-cols-[1fr_auto] items-start gap-4"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-medium text-foreground">
                            {transactionLabel(transaction)}
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                            {transaction.counterpartyIban}
                          </p> */}
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
              ))}
            </div>
          </div>
        </section>
      </main>
    </Container>
  );
}
