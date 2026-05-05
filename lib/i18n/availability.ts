import type { TFunction } from "i18next";
import type { Availability } from "@/data/catalog";

export function translateAvailability(t: TFunction, a: Availability): string {
  switch (a.kind) {
    case "available":
      return t("availability.available", { ns: "shop" });
    case "unavailable_unknown":
      return t("availability.unavailable", { ns: "shop" });
    case "restock":
      if (a.unit === "days") {
        return t("availability.inDays", { ns: "shop", count: a.amount });
      }
      return t("availability.inWeeks", { ns: "shop", count: a.amount });
  }
}
