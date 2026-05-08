import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n/settings";

const CONNECTED_COOKIE = "bank_is_connected";

function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  const parts = header.split(",").map((p) => p.trim().split(";")[0]?.toLowerCase() ?? "");
  for (const part of parts) {
    if (part.startsWith("fr")) return "fr";
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const raw = request.cookies.get(LOCALE_COOKIE)?.value;
  let locale: Locale;
  if (isLocale(raw)) {
    locale = raw;
  } else {
    locale = localeFromAcceptLanguage(request.headers.get("accept-language"));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const pathname = request.nextUrl.pathname;
  const isConnected = request.cookies.get(CONNECTED_COOKIE)?.value === "1";
  const shouldRedirectToHome = pathname !== "/" && !isConnected;

  const response = shouldRedirectToHome
    ? NextResponse.redirect(new URL("/", request.url))
    : NextResponse.next({
        request: { headers: requestHeaders },
      });

  if (!isLocale(raw)) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
