"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n/settings";

type Props = { locale: Locale };

export function SiteHeader({ locale }: Props) {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const isPayments = pathname === "/payments";
  const isHome = pathname === "/";

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
          <nav aria-label={t("nav.main")} className="flex items-center gap-1 text-sm font-medium">
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
          </nav>
        </div>
        <LanguageSwitcher current={locale} />
      </div>
    </header>
  );
}
