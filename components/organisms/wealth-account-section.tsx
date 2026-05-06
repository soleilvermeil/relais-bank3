import { Button } from "@/components/atoms/button";
import { SectionTitle } from "@/components/atoms/section-title";

export type WealthAccount = {
  name: string;
  identifier: string;
  balance: number;
};

type Props = {
  title: string;
  accounts: WealthAccount[];
  totalLabel: string;
  detailsLabel: string;
  formatCurrency: (amount: number) => string;
};

function sectionTotal(accounts: WealthAccount[]): number {
  return accounts.reduce((sum, account) => sum + account.balance, 0);
}

export function WealthAccountSection({
  title,
  accounts,
  totalLabel,
  detailsLabel,
  formatCurrency,
}: Props) {
  const total = sectionTotal(accounts);

  return (
    <section className="space-y-4">
      <SectionTitle as="h2">{title}</SectionTitle>
      <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
        <div>
          {accounts.map((account, index) => (
            <article
              key={`${title}-${account.identifier}`}
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
                    <Button variant="secondary">{detailsLabel}</Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-3 border-t border-card-border pt-3">
          <p className="flex items-center justify-between text-sm sm:text-base">
            <span className="font-medium text-foreground">{totalLabel}</span>
            <span className={`font-semibold ${total < 0 ? "text-red-600" : "text-foreground"}`}>
              {formatCurrency(total)}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
