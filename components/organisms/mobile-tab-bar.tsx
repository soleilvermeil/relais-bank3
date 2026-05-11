"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CreditCard, Home, LogOut, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type TabItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  isActive: (pathname: string) => boolean;
};

const TAB_ITEMS: TabItem[] = [
  {
    href: "/",
    icon: Home,
    labelKey: "bankNavigation.wealth",
    isActive: (p) => p === "/",
  },
  {
    href: "/payments",
    icon: CreditCard,
    labelKey: "bankNavigation.payments",
    isActive: (p) => p === "/payments" || p.startsWith("/payments/"),
  },
  {
    href: "/profile",
    icon: User,
    labelKey: "bankNavigation.profile",
    isActive: (p) => p === "/profile",
  },
];

export function MobileTabBar() {
  const { t } = useTranslation("common");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md print:hidden md:hidden"
    >
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-4">
        {TAB_ITEMS.map(({ href, icon: Icon, labelKey, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  active ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex">
          <form action={logoutAction} className="flex flex-1">
            <button
              type="submit"
              className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <LogOut className="size-5" aria-hidden="true" />
              <span>{t("bankNavigation.disconnect")}</span>
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
