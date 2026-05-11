import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n/settings";
import { PATHNAME_HEADER } from "@/lib/internal-headers";

const USER_CONTRACT_COOKIE = "bank_user_contract";
const PENDING_SIGNUP_COOKIE = "bank_pending_signup";

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
  requestHeaders.set(PATHNAME_HEADER, pathname);
  const contractCookie = request.cookies.get(USER_CONTRACT_COOKIE)?.value;
  const pendingCookie = request.cookies.get(PENDING_SIGNUP_COOKIE)?.value;
  const hasFullSession = Boolean(contractCookie && contractCookie.length > 0);
  const hasPendingSignup = Boolean(pendingCookie && pendingCookie.length > 0);

  let response: NextResponse;
  if (!hasFullSession && !hasPendingSignup) {
    response =
      pathname !== "/"
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next({ request: { headers: requestHeaders } });
  } else if (hasPendingSignup && !hasFullSession) {
    response =
      pathname === "/onboarding"
        ? NextResponse.next({ request: { headers: requestHeaders } })
        : NextResponse.redirect(new URL("/onboarding", request.url));
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

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
