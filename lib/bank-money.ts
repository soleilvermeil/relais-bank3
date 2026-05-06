const chfCurrency = new Intl.NumberFormat("en-CH", {
  style: "currency",
  currency: "CHF",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatChfCurrency(amount: number): string {
  if (amount < 0) {
    return `-${chfCurrency.format(Math.abs(amount))}`;
  }
  return chfCurrency.format(amount);
}
