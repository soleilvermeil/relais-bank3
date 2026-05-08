export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_HEADER = "x-next-locale";

export const namespaces = ["common"] as const;
export type Namespace = (typeof namespaces)[number];

export const defaultNS: Namespace = "common";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "fr";
}
