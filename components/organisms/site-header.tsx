"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n/settings";
import { logoutAction } from "@/app/actions/auth";

type Props = { locale: Locale; isConnected: boolean; isPendingSignup?: boolean };

export function SiteHeader({ locale, isConnected, isPendingSignup = false }: Props) {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const isPayments = pathname === "/payments";
  const isHome = pathname === "/";
  const isProfile = pathname === "/profile";

  return (
    <header className="sticky top-0 z-40 border-b border-card-border bg-background/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold tracking-tight text-primary focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("brand")}
            <span className="sr-only">{t("brandSr")}</span>
          </Link>
          {isConnected ? (
            <nav aria-label={t("nav.main")} className="hidden items-center gap-1 text-sm font-medium md:flex">
              <Link
                href="/"
                className={`rounded-lg px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isHome ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary"
                }`}
              >
                {t("bankNavigation.wealth")}
              </Link>
              <Link
                href="/payments"
                className={`rounded-lg px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isPayments ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary"
                }`}
              >
                {t("bankNavigation.payments")}
              </Link>
              <Link
                href="/profile"
                className={`rounded-lg px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isProfile ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary"
                }`}
              >
                {t("bankNavigation.profile")}
              </Link>
            </nav>
          ) : isPendingSignup ? (
            <p className="text-sm text-muted-foreground">{t("bankNavigation.pendingSignup")}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher current={locale} />
          {isConnected ? (
            <form action={logoutAction} className="hidden md:block">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-card-border bg-muted px-5 py-2.5 text-base font-medium text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("bankNavigation.disconnect")}
              </button>
            </form>
          ) : isPendingSignup ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-card-border bg-muted px-5 py-2.5 text-base font-medium text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("bankNavigation.disconnect")}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
