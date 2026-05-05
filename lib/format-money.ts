const formatter = new Intl.NumberFormat("fr-CH", {
  style: "currency",
  currency: "CHF",
});

export function formatChf(amount: number): string {
  return formatter.format(amount);
}

/**
 * Plain CHF formatting for PDF output: ASCII digits, apostrophe as thousands
 * separator (Swiss-style), avoids narrow spaces that render incorrectly in
 * jsPDF’s built-in fonts.
 */
export function formatChfPdf(amount: number): string {
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const [whole, frac = "00"] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const num = `${negative ? "-" : ""}${grouped}.${frac}`;
  return `${num} CHF`;
}
