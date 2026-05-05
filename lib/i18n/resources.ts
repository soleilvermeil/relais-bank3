import type { Resource } from "i18next";
import enCatalog from "@/locales/en/catalog.json";
import enCommon from "@/locales/en/common.json";
import enShop from "@/locales/en/shop.json";
import frCatalog from "@/locales/fr/catalog.json";
import frCommon from "@/locales/fr/common.json";
import frShop from "@/locales/fr/shop.json";

export const resources: Resource = {
  en: {
    common: enCommon,
    shop: enShop,
    catalog: enCatalog,
  },
  fr: {
    common: frCommon,
    shop: frShop,
    catalog: frCatalog,
  },
};
