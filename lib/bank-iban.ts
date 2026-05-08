/** Normalize IBAN / identifier for comparison (spaces removed, uppercased). */
export function normalizeIban(value: string | null | undefined): string {
  return (value ?? "").replace(/\s/g, "").toUpperCase();
}
