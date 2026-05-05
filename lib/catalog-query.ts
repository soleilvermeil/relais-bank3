import type { TFunction } from "i18next";
import type { Availability, Product } from "@/data/catalog";
import { availabilityApproxDays, featuredIndexOf } from "@/data/catalog";
import { getPricingForProduct } from "@/lib/daily-discounts";
import {
  translateProductDescription,
  translateProductName,
} from "@/lib/i18n/product-copy";

/** Default list order in catalog (`smart`). */
export type SortKey =
  | "smart"
  | "discount-desc"
  | "price-asc"
  | "price-desc"
  | "rating-asc"
  | "rating-desc"
  | "name"
  /** Ready first, then soonest restock, then unknown ETA last; tie-break by catalog order. */
  | "availability-first"
  /** Most ratings first, then higher average, then catalog order. */
  | "popularity-desc";

export type CatalogQuery = {
  sort: SortKey;
  /** Minimum star rating (1–5), or 0 meaning “any”. */
  minRating: number;
  /** Availability window filter. */
  availability: AvailabilityFilter;
  /** Minimum number of reviews (0 = any). */
  minReviews: number;
  /** Lower/upper price bounds in CHF (null = open interval). */
  minPrice: number | null;
  maxPrice: number | null;
  /**
   * Case-insensitive substring on localized fields
   * (name, category label, description in active locale + English).
   */
  q: string;
  /** `all` or exact `product.brand` from catalog. */
  brand: string;
};

export type AvailabilityFilter = "any" | "now" | "3d" | "1w" | "1m";

/** i18n context for search and name sort (see `applyCatalogQuery`). */
export type CatalogQueryI18n = {
  t: TFunction;
  tEn: TFunction;
  /** BCP 47 locale for `localeCompare` (e.g. from `getIntlLocale`). */
  locale: string;
};

const SORT_KEYS = new Set<SortKey>([
  "smart",
  "discount-desc",
  "price-asc",
  "price-desc",
  "rating-asc",
  "rating-desc",
  "name",
  "availability-first",
  "popularity-desc",
]);

const AVAILABILITY_FILTERS = new Set<AvailabilityFilter>([
  "any",
  "now",
  "3d",
  "1w",
  "1m",
]);

export function parseSort(raw: string | undefined): SortKey {
  if (raw && SORT_KEYS.has(raw as SortKey)) return raw as SortKey;
  return "smart";
}

export function parseAvailabilityFilter(
  raw: string | undefined,
): AvailabilityFilter {
  if (raw && AVAILABILITY_FILTERS.has(raw as AvailabilityFilter)) {
    return raw as AvailabilityFilter;
  }
  return "any";
}

/** `min` query: 1–5 = at least that many stars; anything else = any. */
export function parseMinRating(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) return 0;
  return n;
}

export function parseMinReviews(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number(raw);
  if (n === 100 || n === 1000) return n;
  return 0;
}

function parseNullablePriceBound(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parsePriceRange(rawMin: string | undefined, rawMax: string | undefined): {
  minPrice: number | null;
  maxPrice: number | null;
} {
  const minPrice = parseNullablePriceBound(rawMin);
  const maxPrice = parseNullablePriceBound(rawMax);
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return { minPrice: maxPrice, maxPrice: minPrice };
  }
  return { minPrice, maxPrice };
}

/** Trimmed search string; empty means no text filter. */
export function parseNameQuery(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim();
}

/** `brand` query: omit or `all` means any brand; otherwise exact match to `Product.brand`. */
export function parseBrand(
  raw: string | undefined,
  validBrands: string[],
): string {
  const s = String(raw ?? "").trim();
  if (!s || s === "all") return "all";
  const set = new Set(validBrands);
  return set.has(s) ? s : "all";
}

function stockRank(a: Availability): number {
  if (a.kind === "available") return 0;
  if (a.kind === "unavailable_unknown") return 100000;
  const days = availabilityApproxDays(a);
  return days ?? 99999;
}

function availabilityScore(a: Availability): number {
  if (a.kind === "available") return 1;
  if (a.kind === "unavailable_unknown") return 0;
  const days = availabilityApproxDays(a);
  if (days == null) return 0;
  // Linear decay to 0 over a 30-day horizon.
  return Math.max(0, 1 - days / 30);
}

function bayesianRatingScore(
  rating: number,
  ratingCount: number,
  globalAverage: number,
): number {
  const minimumReviewWeight = 20;
  const blended =
    (ratingCount / (ratingCount + minimumReviewWeight)) * rating +
    (minimumReviewWeight / (ratingCount + minimumReviewWeight)) * globalAverage;
  // Ratings are on a 1-5 scale; normalize to 0-1.
  return Math.max(0, Math.min(1, (blended - 1) / 4));
}

export function filterByRatingMin(
  list: Product[],
  minRating: number,
): Product[] {
  if (minRating < 1) return list;
  return list.filter((p) => p.averageRating >= minRating);
}

export function filterByNameQuery(
  list: Product[],
  q: string,
  t: TFunction,
  tEn: TFunction,
): Product[] {
  if (!q) return list;
  const lower = q.toLowerCase();
  return list.filter((p) => {
    const localizedFields = [
      translateProductName(t, p),
      t(`category.${p.category}`, { ns: "shop" }),
      translateProductDescription(t, p),
    ];
    if (localizedFields.some((value) => value.toLowerCase().includes(lower))) {
      return true;
    }

    const englishFields = [
      translateProductName(tEn, p),
      tEn(`category.${p.category}`, { ns: "shop" }),
      translateProductDescription(tEn, p),
    ];
    return englishFields.some((value) => value.toLowerCase().includes(lower));
  });
}

export function filterByBrand(list: Product[], brand: string): Product[] {
  if (brand === "all") return list;
  return list.filter((p) => p.brand === brand);
}

export function filterByAvailability(
  list: Product[],
  availability: AvailabilityFilter,
): Product[] {
  if (availability === "any") return list;
  if (availability === "now") {
    return list.filter((p) => p.availability.kind === "available");
  }
  const maxDaysByFilter: Record<Exclude<AvailabilityFilter, "any" | "now">, number> = {
    "3d": 3,
    "1w": 7,
    "1m": 30,
  };
  const maxDays = maxDaysByFilter[availability];
  return list.filter((p) => {
    if (p.availability.kind === "available") return true;
    const days = availabilityApproxDays(p.availability);
    if (days == null) return false;
    return days <= maxDays;
  });
}

export function filterByMinReviews(list: Product[], minReviews: number): Product[] {
  if (minReviews < 1) return list;
  return list.filter((p) => p.ratingCount >= minReviews);
}

export function filterByPriceRange(
  list: Product[],
  minPrice: number | null,
  maxPrice: number | null,
): Product[] {
  return list.filter((p) => {
    const { discountedPriceChf } = getPricingForProduct(p);
    if (minPrice !== null && discountedPriceChf < minPrice) return false;
    if (maxPrice !== null && discountedPriceChf > maxPrice) return false;
    return true;
  });
}

export function sortProducts(
  list: Product[],
  sort: SortKey,
  i18n?: CatalogQueryI18n,
): Product[] {
  const out = [...list];
  const tieFeatured = (a: Product, b: Product) =>
    featuredIndexOf(a.id) - featuredIndexOf(b.id);

  switch (sort) {
    case "smart": {
      const globalAverage =
        out.reduce((sum, p) => sum + p.averageRating, 0) / Math.max(out.length, 1);
      return out.sort((a, b) => {
        const scoreA =
          0.7 *
            bayesianRatingScore(a.averageRating, a.ratingCount, globalAverage) +
          0.3 * availabilityScore(a.availability);
        const scoreB =
          0.7 *
            bayesianRatingScore(b.averageRating, b.ratingCount, globalAverage) +
          0.3 * availabilityScore(b.availability);
        const ds = scoreB - scoreA;
        if (ds !== 0) return ds;

        const dReviews = b.ratingCount - a.ratingCount;
        if (dReviews !== 0) return dReviews;

        return tieFeatured(a, b);
      });
    }
    case "discount-desc":
      return out.sort((a, b) => {
        const d =
          getPricingForProduct(b).discountRate -
          getPricingForProduct(a).discountRate;
        if (d !== 0) return d;
        return tieFeatured(a, b);
      });
    case "price-asc":
      return out.sort(
        (a, b) =>
          getPricingForProduct(a).discountedPriceChf -
            getPricingForProduct(b).discountedPriceChf ||
          featuredIndexOf(a.id) - featuredIndexOf(b.id),
      );
    case "price-desc":
      return out.sort(
        (a, b) =>
          getPricingForProduct(b).discountedPriceChf -
            getPricingForProduct(a).discountedPriceChf ||
          featuredIndexOf(a.id) - featuredIndexOf(b.id),
      );
    case "rating-asc":
      return out.sort(
        (a, b) =>
          a.averageRating - b.averageRating ||
          featuredIndexOf(a.id) - featuredIndexOf(b.id),
      );
    case "rating-desc":
      return out.sort(
        (a, b) =>
          b.averageRating - a.averageRating ||
          featuredIndexOf(a.id) - featuredIndexOf(b.id),
      );
    case "popularity-desc":
      return out.sort((a, b) => {
        const d = b.ratingCount - a.ratingCount;
        if (d !== 0) return d;
        const dr = b.averageRating - a.averageRating;
        if (dr !== 0) return dr;
        return tieFeatured(a, b);
      });
    case "name": {
      if (!i18n) {
        return out.sort(tieFeatured);
      }
      const { t, locale } = i18n;
      return out.sort((a, b) => {
        const cmp = translateProductName(t, a).localeCompare(
          translateProductName(t, b),
          locale,
          { sensitivity: "base" },
        );
        if (cmp !== 0) return cmp;
        return tieFeatured(a, b);
      });
    }
    case "availability-first":
      return out.sort((a, b) => {
        const d = stockRank(a.availability) - stockRank(b.availability);
        if (d !== 0) return d;
        return tieFeatured(a, b);
      });
    default:
      return out.sort(tieFeatured);
  }
}

/**
 * Category slice → brand → text query → min rating → sort.
 */
export function applyCatalogQuery(
  list: Product[],
  q: CatalogQuery,
  i18n: CatalogQueryI18n,
): Product[] {
  let next = list;
  next = filterByAvailability(next, q.availability);
  next = filterByBrand(next, q.brand);
  next = filterByMinReviews(next, q.minReviews);
  next = filterByPriceRange(next, q.minPrice, q.maxPrice);
  next = filterByNameQuery(next, q.q, i18n.t, i18n.tEn);
  next = filterByRatingMin(next, q.minRating);
  next = sortProducts(next, q.sort, i18n);
  return next;
}
