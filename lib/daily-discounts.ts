import type { MacroCategory, Product } from "@/data/catalog";
import { getMacroCategoryBySubcategory } from "@/data/catalog";

type DiscountConfig = {
  maxDiscount: number;
  k: number;
};

export const DISCOUNT_CONFIG_BY_MACRO_CATEGORY: Record<
  MacroCategory,
  DiscountConfig
> = {
  electronics: { maxDiscount: 0.8, k: 5 },
  "sports-outdoors": { maxDiscount: 0.5, k: 5 },
  pantry: { maxDiscount: 0.0, k: 5 },
  "fresh-food": { maxDiscount: 0.0, k: 5 },
};

const PERCENT_STEP = 0.10;

function hashToUint32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dateKeyUTC(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function roundRateToNearestStep(rate: number, step: number): number {
  return Math.round(rate / step) * step;
}

function clampRate(rate: number, maxRate: number): number {
  return Math.max(0, Math.min(maxRate, rate));
}

function dailyRandomForProduct(productId: string, now: Date): number {
  const seed = dateKeyUTC(now);
  const hash = hashToUint32(`${seed}:${productId}`);
  return hash / 2 ** 32;
}

export function getDiscountRateForProduct(product: Product, now = new Date()): number {
  if (product.availability.kind !== "available") return 0;
  const macroCategory = getMacroCategoryBySubcategory(product.category);
  if (!macroCategory) return 0;
  const { maxDiscount, k } = DISCOUNT_CONFIG_BY_MACRO_CATEGORY[macroCategory];
  if (maxDiscount <= 0) return 0;
  const random = dailyRandomForProduct(product.id, now);
  const rawRate = maxDiscount / (1 + random) ** k;
  const rounded = roundRateToNearestStep(rawRate, PERCENT_STEP);
  return clampRate(rounded, maxDiscount);
}

export function getDiscountedPrice(priceChf: number, discountRate: number): number {
  return Math.round(priceChf * (1 - discountRate) * 20) / 20;
}

export function getPricingForProduct(product: Product, now = new Date()) {
  const discountRate = getDiscountRateForProduct(product, now);
  return {
    basePriceChf: product.priceChf,
    discountRate,
    discountedPriceChf: getDiscountedPrice(product.priceChf, discountRate),
  };
}

export function toDiscountPercent(discountRate: number): number {
  return Math.round(discountRate * 100);
}
