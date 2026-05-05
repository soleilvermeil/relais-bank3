"use client";

import { useMemo } from "react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { Locale } from "@/lib/i18n/settings";
import { defaultNS, namespaces } from "@/lib/i18n/settings";
import { resources } from "@/lib/i18n/resources";

type Props = {
  locale: Locale;
  children: React.ReactNode;
};

export function I18nProvider({ locale, children }: Props) {
  const instance = useMemo(() => {
    const i18n = i18next.createInstance();
    i18n.use(initReactI18next).init({
      lng: locale,
      fallbackLng: "en",
      resources,
      ns: [...namespaces],
      defaultNS,
      interpolation: { escapeValue: false },
    });
    return i18n;
  }, [locale]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
