import { createInstance, type TFunction } from "i18next";
import { getLocale } from "@/lib/i18n/get-locale";
import { defaultNS, namespaces, type Locale } from "@/lib/i18n/settings";
import { resources } from "@/lib/i18n/resources";

async function createFixedT(lng: Locale): Promise<TFunction> {
  const i18n = createInstance();
  await i18n.init({
    lng,
    fallbackLng: "en",
    resources,
    ns: [...namespaces],
    defaultNS,
    interpolation: { escapeValue: false },
  });
  return i18n.getFixedT(lng);
}

export async function getServerT(): Promise<TFunction> {
  const locale = await getLocale();
  return createFixedT(locale);
}
