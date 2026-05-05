import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n/settings";

export async function getLocale(): Promise<Locale> {
  const fromHeader = (await headers()).get(LOCALE_HEADER);
  if (isLocale(fromHeader)) return fromHeader;

  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return defaultLocale;
}

/** BCP 47 locale for Intl / date formatting */
export async function getIntlLocale(): Promise<string> {
  const locale = await getLocale();
  return locale === "fr" ? "fr-CH" : "en-CH";
}
