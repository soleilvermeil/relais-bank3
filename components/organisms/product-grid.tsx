import type { Product } from "@/data/catalog";
import type { TFunction } from "i18next";
import { getPricingForProduct, toDiscountPercent } from "@/lib/daily-discounts";
import { translateAvailability } from "@/lib/i18n/availability";
import {
  translateProductDescription,
  translateProductName,
} from "@/lib/i18n/product-copy";
import { ProductCard } from "@/components/molecules/product-card";

type Props = { products: Product[]; narrowEmptyMessage?: boolean; t: TFunction };

export function ProductGrid({
  products,
  narrowEmptyMessage,
  t,
}: Props) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-card-border bg-muted/50 p-8 text-center text-muted-foreground">
        {narrowEmptyMessage
          ? t("productGrid.emptyFiltered", { ns: "shop" })
          : t("productGrid.emptyCategory", { ns: "shop" })}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const title = translateProductName(t, product);
        const pricing = getPricingForProduct(product);
        const discountPercent = toDiscountPercent(pricing.discountRate);
        return (
          <li key={product.id} className="h-full">
            <ProductCard
              product={product}
              pricing={pricing}
              title={title}
              description={translateProductDescription(t, product)}
              categoryLabel={t(`category.${product.category}`, { ns: "shop" })}
              availabilityLabel={translateAvailability(t, product.availability)}
              viewDetails={t("productCard.viewDetails", { ns: "shop" })}
              viewDetailsAria={t("productCard.viewAria", {
                ns: "shop",
                name: title,
              })}
              discountLabel={t("productCard.discountBadge", {
                ns: "shop",
                discount: discountPercent,
              })}
              originalPriceLabel={t("productCard.originalPrice", {
                ns: "shop",
              })}
            />
          </li>
        );
      })}
    </ul>
  );
}
