import { notFound } from "next/navigation";
import type { Category, MacroCategory } from "@/data/catalog";
import {
  MACRO_CATEGORIES,
  getProductsByCategory,
  getProductsByMacroCategory,
  getSubcategoriesByMacroCategory,
} from "@/data/catalog";
import {
  applyCatalogQuery,
  parseAvailabilityFilter,
  parseBrand,
  parseMinReviews,
  parseMinRating,
  parseNameQuery,
  parsePriceRange,
  parseSort,
} from "@/lib/catalog-query";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { getFixedServerT, getServerT } from "@/lib/i18n/server";
import type { ShopSearchState } from "@/lib/shop-catalog-url";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { CatalogResultsToolbar } from "@/components/molecules/catalog-results-toolbar";
import { CatalogFilterGrid } from "@/components/organisms/catalog-filter-grid";
import { ProductGrid } from "@/components/organisms/product-grid";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    category?: string | string[];
    sort?: string | string[];
    min?: string | string[];
    availability?: string | string[];
    reviews?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
    q?: string | string[];
    brand?: string | string[];
  }>;
};

function firstParam(
  v: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseMacroCategory(raw: string): MacroCategory | null {
  return MACRO_CATEGORIES.includes(raw as MacroCategory)
    ? (raw as MacroCategory)
    : null;
}

function parseSubcategory(
  raw: string | undefined,
  allowed: Category[],
): Category | "all" {
  if (!raw || raw === "all") return "all";
  return allowed.includes(raw as Category) ? (raw as Category) : "all";
}

export function generateStaticParams() {
  return MACRO_CATEGORIES.map((category) => ({ category }));
}

export default async function MacroCategoryPage({ params, searchParams }: Props) {
  const p = await params;
  const macroCategory = parseMacroCategory(p.category);
  if (!macroCategory) {
    notFound();
  }

  const t = await getServerT();
  const tEn = await getFixedServerT("en");
  const intlLocale = await getIntlLocale();
  const sp = await searchParams;
  const subcategories = getSubcategoriesByMacroCategory(macroCategory);

  const selectedSubcategory = parseSubcategory(firstParam(sp.category), subcategories);
  const sort = parseSort(firstParam(sp.sort));
  const minRating = parseMinRating(firstParam(sp.min));
  const availability = parseAvailabilityFilter(firstParam(sp.availability));
  const minReviews = parseMinReviews(firstParam(sp.reviews));
  const { minPrice, maxPrice } = parsePriceRange(
    firstParam(sp.minPrice),
    firstParam(sp.maxPrice),
  );
  const q = parseNameQuery(firstParam(sp.q));
  const macroProducts = getProductsByMacroCategory(macroCategory);
  const brandOptions = [...new Set(macroProducts.map((p) => p.brand))].sort((a, b) =>
    a.localeCompare(b, "en"),
  );
  const brand = parseBrand(firstParam(sp.brand), brandOptions);

  const searchState: ShopSearchState = {
    category: selectedSubcategory,
    sort,
    minRating,
    availability,
    minReviews,
    minPrice,
    maxPrice,
    q,
    brand,
  };

  const baseList =
    selectedSubcategory === "all"
      ? macroProducts
      : getProductsByCategory(selectedSubcategory);

  const list = applyCatalogQuery(
    baseList,
    {
      sort,
      minRating,
      availability,
      minReviews,
      minPrice,
      maxPrice,
      q,
      brand,
    },
    { t, tEn, locale: intlLocale },
  );

  const filtersActive =
    selectedSubcategory !== "all" ||
    sort !== "smart" ||
    minRating >= 1 ||
    availability !== "any" ||
    minReviews >= 1 ||
    minPrice !== null ||
    maxPrice !== null ||
    q.length > 0 ||
    brand !== "all";

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <header className="space-y-3">
          <SectionTitle as="h1">
            {t(`macroCategory.${macroCategory}`, { ns: "shop" })}
          </SectionTitle>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t("home.intro", { ns: "shop" })}
          </p>
        </header>
        <CatalogFilterGrid
          searchState={searchState}
          brandOptions={brandOptions}
          categoryOptions={subcategories}
          basePath={`/categories/${macroCategory}`}
        />
        <CatalogResultsToolbar
          count={list.length}
          filtersActive={filtersActive}
          searchState={searchState}
          basePath={`/categories/${macroCategory}`}
        />
        <ProductGrid products={list} narrowEmptyMessage={filtersActive} t={t} />
      </main>
    </Container>
  );
}
