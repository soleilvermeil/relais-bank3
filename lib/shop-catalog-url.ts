import type { Category } from "@/data/catalog";
import type { AvailabilityFilter, SortKey } from "@/lib/catalog-query";

export type ShopSearchState = {
  category: Category | "all";
  sort: SortKey;
  /** 0 = any minimum rating */
  minRating: number;
  /** availability window */
  availability: AvailabilityFilter;
  /** 0 = any */
  minReviews: number;
  /** null = no lower bound */
  minPrice: number | null;
  /** null = no upper bound */
  maxPrice: number | null;
  /** Trimmed; empty = no search */
  q: string;
  /** `all` or exact brand string from catalog */
  brand: string;
};

function applyToParams(sp: URLSearchParams, state: ShopSearchState): void {
  if (state.category !== "all") {
    sp.set("category", state.category);
  } else {
    sp.delete("category");
  }

  if (state.sort !== "smart") {
    sp.set("sort", state.sort);
  } else {
    sp.delete("sort");
  }

  if (state.minRating >= 1 && state.minRating <= 5) {
    sp.set("min", String(state.minRating));
  } else {
    sp.delete("min");
  }

  if (state.availability !== "any") {
    sp.set("availability", state.availability);
  } else {
    sp.delete("availability");
  }

  if (state.minReviews >= 1) {
    sp.set("reviews", String(state.minReviews));
  } else {
    sp.delete("reviews");
  }

  if (state.minPrice !== null) {
    sp.set("minPrice", String(state.minPrice));
  } else {
    sp.delete("minPrice");
  }

  if (state.maxPrice !== null) {
    sp.set("maxPrice", String(state.maxPrice));
  } else {
    sp.delete("maxPrice");
  }

  if (state.q.trim()) {
    sp.set("q", state.q.trim());
  } else {
    sp.delete("q");
  }

  if (state.brand !== "all") {
    sp.set("brand", state.brand);
  } else {
    sp.delete("brand");
  }
}

/** Default shop home URL state. */
export function defaultShopSearchState(): ShopSearchState {
  return {
    category: "all",
    sort: "smart",
    minRating: 0,
    availability: "any",
    minReviews: 0,
    minPrice: null,
    maxPrice: null,
    q: "",
    brand: "all",
  };
}

/** Builds a catalog URL from a full search state. */
export function buildShopSearchHref(
  state: ShopSearchState,
  basePath = "/",
): string {
  const sp = new URLSearchParams();
  applyToParams(sp, state);
  const q = sp.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function patchShopSearchHref(
  current: ShopSearchState,
  patch: Partial<ShopSearchState>,
  basePath = "/",
): string {
  return buildShopSearchHref({ ...current, ...patch }, basePath);
}
