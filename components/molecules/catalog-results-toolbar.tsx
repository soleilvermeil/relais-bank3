"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { SortKey } from "@/lib/catalog-query";
import type { ShopSearchState } from "@/lib/shop-catalog-url";
import { patchShopSearchHref } from "@/lib/shop-catalog-url";
import { Select } from "@/components/atoms/select";

type Props = {
  count: number;
  filtersActive: boolean;
  searchState: ShopSearchState;
  basePath?: string;
};

const sortKeys: SortKey[] = [
  "smart",
  "discount-desc",
  "availability-first",
  "popularity-desc",
  "price-asc",
  "price-desc",
  "rating-desc",
  "rating-asc",
  "name",
];

export function CatalogResultsToolbar({
  count,
  filtersActive,
  searchState,
  basePath = "/",
}: Props) {
  const { t } = useTranslation("shop");
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t("home.showing", { count })}
        {filtersActive ? ` ${t("home.filtersActive")}` : ""}
      </p>
      <div className="w-full sm:w-64">
        <label htmlFor="results-sort" className="sr-only">
          {t("catalog.sortBy")}
        </label>
        <Select
          id="results-sort"
          value={searchState.sort}
          onChange={(e) => {
            router.push(
              patchShopSearchHref(
                searchState,
                { sort: e.target.value as SortKey },
                basePath,
              ),
            );
          }}
        >
          {sortKeys.map((key) => (
            <option key={key} value={key}>
              {t(`catalog.sort.${key}`)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
