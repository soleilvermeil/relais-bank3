import type { TFunction } from "i18next";
import type { Product } from "@/data/catalog";

export function translateProductName(t: TFunction, p: Product): string {
  return t(`products.${p.id}.name`, { ns: "catalog" });
}

export function translateProductDescription(t: TFunction, p: Product): string {
  return t(`products.${p.id}.description`, { ns: "catalog", defaultValue: "" });
}

export function translateProductCharacteristics(
  t: TFunction,
  p: Product,
): string[] {
  const raw = t(`products.${p.id}.characteristics`, {
    ns: "catalog",
    defaultValue: "",
  });
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
