"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPreferredLocale } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/settings";
import { locales } from "@/lib/i18n/settings";

type Props = { current: Locale };

export function LanguageSwitcher({ current }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function selectLocale(next: Locale) {
    if (next === current || pending) return;
    startTransition(async () => {
      await setPreferredLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map((loc, i) => (
        <span key={loc} className="inline-flex items-center gap-1">
          {i > 0 ? (
            <span className="text-card-border" aria-hidden="true">
              |
            </span>
          ) : null}
          {loc === current ? (
            <span className="font-semibold text-foreground">{loc.toUpperCase()}</span>
          ) : (
            <button
              type="button"
              disabled={pending}
              className="rounded px-1 font-medium text-muted-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              onClick={() => selectLocale(loc)}
            >
              {loc.toUpperCase()}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
