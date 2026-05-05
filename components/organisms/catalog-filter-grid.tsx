"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { Category } from "@/data/catalog";
import { CATEGORIES } from "@/data/catalog";
import type { ShopSearchState } from "@/lib/shop-catalog-url";
import {
  buildShopSearchHref,
  defaultShopSearchState,
  patchShopSearchHref,
} from "@/lib/shop-catalog-url";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Select } from "@/components/atoms/select";

type Props = {
  searchState: ShopSearchState;
  brandOptions: string[];
  categoryOptions?: Category[];
  basePath?: string;
};

const minValues = [0, 3, 4, 5] as const;
const availabilityValues = ["any", "now", "3d", "1w", "1m"] as const;
const minReviewValues = [0, 100, 1000] as const;

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function CatalogFilterGrid({
  searchState,
  brandOptions,
  categoryOptions = CATEGORIES,
  basePath = "/",
}: Props) {
  const { t } = useTranslation("shop");
  const router = useRouter();
  const formKey = buildShopSearchHref(searchState, basePath);

  function go(patch: Partial<ShopSearchState>) {
    router.push(patchShopSearchHref(searchState, patch, basePath));
  }

  function patchPriceRange(raw: string, bound: "minPrice" | "maxPrice") {
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) return;
    const nextMin = bound === "minPrice" ? parsed : searchState.minPrice;
    const nextMax = bound === "maxPrice" ? parsed : searchState.maxPrice;
    if (nextMin !== null && nextMax !== null && nextMin > nextMax) {
      go({ minPrice: nextMax, maxPrice: nextMin });
      return;
    }
    go({ [bound]: parsed });
  }

  return (
    <fieldset className="space-y-4 rounded-2xl border border-card-border bg-card p-4 sm:p-6">
      <legend
        id="browse-legend"
        className="px-1 text-base font-semibold text-foreground"
      >
        {t("catalog.legend")}
      </legend>
      <p className="-mt-4 text-sm text-muted-foreground">
        {t("catalog.intro")}
      </p>
      <form
        key={formKey}
        className="grid grid-cols-1 gap-4 gap-y-6 pt-1 sm:grid-cols-2 lg:grid-cols-3"
        aria-labelledby="browse-legend"
      >
        <Field id="field-category" label={t("catalog.category")}>
          <Select
            id="field-category"
            value={
              searchState.category === "all" ? "all" : searchState.category
            }
            onChange={(e) => {
              const v = e.target.value;
              go({
                category:
                  v === "all"
                    ? "all"
                    : (v as Category),
              });
            }}
          >
            <option value="all">{t("catalog.allCategories")}</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {t(`category.${c}`)}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="field-brand" label={t("catalog.brand")}>
          <Select
            id="field-brand"
            value={
              searchState.brand === "all"
                ? "all"
                : brandOptions.includes(searchState.brand)
                  ? searchState.brand
                  : "all"
            }
            onChange={(e) => {
              const v = e.target.value;
              go({ brand: v === "all" ? "all" : v });
            }}
          >
            <option value="all">{t("catalog.allBrands")}</option>
            {brandOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="field-min" label={t("catalog.minRating")}>
          <Select
            id="field-min"
            value={String(
              searchState.minRating >= 1 && searchState.minRating <= 5
                ? searchState.minRating
                : 0,
            )}
            onChange={(e) => {
              go({ minRating: Number(e.target.value) });
            }}
          >
            {minValues.map((value) => {
              const labelKey = value === 0 ? "any" : String(value);
              return (
                <option key={value} value={String(value)}>
                  {t(`catalog.minRatingOption.${labelKey}`)}
                </option>
              );
            })}
          </Select>
        </Field>

        <Field id="field-availability" label={t("catalog.availability")}>
          <Select
            id="field-availability"
            value={searchState.availability}
            onChange={(e) => {
              go({
                availability: e.target.value as ShopSearchState["availability"],
              });
            }}
          >
            {availabilityValues.map((value) => (
              <option key={value} value={value}>
                {t(`catalog.availabilityOption.${value}`)}
              </option>
            ))}
          </Select>
        </Field>

        {/* <Field id="field-reviews" label={t("catalog.reviewsCount")}>
          <Select
            id="field-reviews"
            value={String(searchState.minReviews)}
            onChange={(e) => {
              go({ minReviews: Number(e.target.value) });
            }}
          >
            {minReviewValues.map((value) => {
              const labelKey = value === 0 ? "any" : String(value);
              return (
                <option key={value} value={String(value)}>
                  {t(`catalog.minReviewsOption.${labelKey}`)}
                </option>
              );
            })}
          </Select>
        </Field> */}

        <Field id="field-price-min" label={t("catalog.priceRange")}>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="field-price-min"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              defaultValue={searchState.minPrice ?? ""}
              placeholder={t("catalog.priceMin")}
              aria-label={t("catalog.priceMin")}
              onBlur={(e) => {
                patchPriceRange(e.target.value, "minPrice");
              }}
            />
            <Input
              id="field-price-max"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              defaultValue={searchState.maxPrice ?? ""}
              placeholder={t("catalog.priceMax")}
              aria-label={t("catalog.priceMax")}
              onBlur={(e) => {
                patchPriceRange(e.target.value, "maxPrice");
              }}
            />
          </div>
        </Field>

        <div className="sm:col-span-2 lg:col-span-1">
          <Field id="field-clear" label={t("catalog.clearSection")}>
            <Button
              id="field-clear"
              type="button"
              variant="secondary"
              onClick={() => {
                router.push(buildShopSearchHref(defaultShopSearchState(), basePath));
              }}
            >
              {t("catalog.clearAll")}
            </Button>
          </Field>
        </div>
      </form>
    </fieldset>
  );
}
