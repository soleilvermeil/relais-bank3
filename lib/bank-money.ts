const chfNumber = new Intl.NumberFormat("en-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatChfCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "+";
  const formattedNumber = chfNumber.format(Math.abs(amount)).replaceAll("’", "'");
  return `CHF ${formattedNumber}${sign}`;
}
