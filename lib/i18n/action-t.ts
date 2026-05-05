import { createInstance, type TFunction } from "i18next";
import { getLocale } from "@/lib/i18n/get-locale";
import { defaultNS, namespaces } from "@/lib/i18n/settings";
import { resources } from "@/lib/i18n/resources";

/** Use inside server actions to translate validation messages for the current locale. */
export async function getActionT(): Promise<TFunction> {
  const locale = await getLocale();
  const i18n = createInstance();
  await i18n.init({
    lng: locale,
    fallbackLng: "en",
    resources,
    ns: [...namespaces],
    defaultNS,
    interpolation: { escapeValue: false },
  });
  return i18n.getFixedT(locale);
}
