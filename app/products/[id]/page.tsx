import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getMacroCategoryBySubcategory, getProductById } from "@/data/catalog";
import { productReviewsById } from "@/data/product-reviews";
import { addToCartForm } from "@/app/actions/shop";
import { getPricingForProduct, toDiscountPercent } from "@/lib/daily-discounts";
import { translateAvailability } from "@/lib/i18n/availability";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  translateProductDescription,
  translateProductCharacteristics,
  translateProductName,
} from "@/lib/i18n/product-copy";
import { getServerT } from "@/lib/i18n/server";
import { AvailabilityBadge } from "@/components/atoms/availability-badge";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Price } from "@/components/atoms/price";
import { SectionTitle } from "@/components/atoms/section-title";
import { ProductReviews } from "@/components/molecules/product-reviews";
import { ProductReviewSection } from "@/components/organisms/product-review-section";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const t = await getServerT();
  const locale = await getLocale();
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const availabilityLabel = translateAvailability(t, product.availability);
  const productTitle = translateProductName(t, product);
  const macroCategory = getMacroCategoryBySubcategory(product.category);
  const pricing = getPricingForProduct(product);
  const productDescription = translateProductDescription(t, product);
  const productCharacteristics = translateProductCharacteristics(t, product);
  const hasDiscount = pricing.discountRate > 0;
  const isFrenchLocale = locale === "fr";
  const reviews = productReviewsById[product.id] ?? [];
  const review = reviews[0] ?? null;
  const productEmoji =
    product.category === "laptop"
      ? "💻"
      : product.category === "headset"
        ? "🎧"
        : product.category === "usb-stick"
          ? "💾"
          : product.category === "bicycle"
            ? "🚲"
            : product.category === "coffee"
              ? "☕"
              : product.category === "rice"
                ? "🍚"
                : product.category === "potato"
                  ? "🥔"
                  : product.category === "milk"
                    ? "🥛"
                    : product.category === "plain-yogurt"
                      ? "🥣"
                      : product.category === "tomato"
                        ? "🍅"
                        : "🛒";

  return (
    <Container>
      <main id="main-content">
        <nav
          aria-label={t("product.breadcrumb", { ns: "shop" })}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          {macroCategory ? (
            <>
              <Link
                href={`/categories/${macroCategory}`}
                className="font-medium text-primary hover:underline"
              >
                {t(`macroCategory.${macroCategory}`, { ns: "shop" })}
              </Link>
              <span aria-hidden="true" className="inline-flex shrink-0">
                <ChevronRight className="h-4 w-4" />
              </span>
              <Link
                href={`/categories/${macroCategory}?category=${product.category}`}
                className="font-medium text-primary hover:underline"
              >
                {t(`category.${product.category}`, { ns: "shop" })}
              </Link>
            </>
          ) : (
            <Link href="/" className="font-medium text-primary hover:underline">
              {t("product.shop", { ns: "shop" })}
            </Link>
          )}
          <span aria-hidden="true" className="inline-flex shrink-0">
            <ChevronRight className="h-4 w-4" />
          </span>
          <span className="text-foreground">{productTitle}</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div
            className="flex aspect-square max-h-80 items-center justify-center rounded-3xl bg-muted text-8xl shadow-inner lg:max-h-none"
            aria-hidden="true"
          >
            {productEmoji}
          </div>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(`category.${product.category}`, { ns: "shop" })}</Badge>
              {hasDiscount ? (
                <span className="inline-flex items-center rounded-full bg-orange-700/80 px-2.5 py-0.5 text-xs font-medium text-white">
                  {t("productCard.discountBadge", {
                    ns: "shop",
                    discount: toDiscountPercent(pricing.discountRate),
                  })}
                </span>
              ) : null}
              <AvailabilityBadge
                availability={product.availability}
                label={availabilityLabel}
              />
            </div>
            <ProductReviews
              rating={product.averageRating}
              ratingCount={product.ratingCount}
              reviewSectionId="product-reviews"
            />
            <SectionTitle as="h1">{productTitle}</SectionTitle>
            <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
            {productDescription ? (
              <p className="text-lg text-muted-foreground">{productDescription}</p>
            ) : null}
            {productCharacteristics.length > 0 ? (
              <section
                aria-label={t("product.characteristicsTitle", { ns: "shop" })}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  {t("product.characteristicsTitle", { ns: "shop" })}
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {productCharacteristics.map((characteristic) => (
                    <li key={characteristic}>{characteristic}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <div className="flex items-baseline gap-3 text-2xl">
              {hasDiscount ? (
                <Price
                  amount={pricing.basePriceChf}
                  aria-label={t("productCard.originalPrice", { ns: "shop" })}
                  className="text-base text-muted-foreground line-through"
                />
              ) : null}
              <Price amount={pricing.discountedPriceChf} />
            </div>
            <form action={addToCartForm} className="flex flex-wrap items-end gap-4">
              <input type="hidden" name="productId" value={product.id} />
              <div className="space-y-1">
                <Label htmlFor="qty">{t("product.quantity", { ns: "shop" })}</Label>
                <div className="w-24">
                  <Input
                    id="qty"
                    name="quantity"
                    type="number"
                    min={1}
                    max={99}
                    defaultValue={1}
                  />
                </div>
              </div>
              <Button type="submit">{t("product.addToCart", { ns: "shop" })}</Button>
            </form>
            <p className="text-sm text-muted-foreground">
              {t("product.cookieNote", { ns: "shop" })}
            </p>
          </div>
        </div>
        <ProductReviewSection
          sectionId="product-reviews"
          review={review}
          isFrenchLocale={isFrenchLocale}
          title={t("review.sectionTitle", { ns: "shop" })}
          emptyTitle={t("review.emptyTitle", { ns: "shop" })}
          emptyBody={t("review.emptyBody", { ns: "shop" })}
        />
      </main>
    </Container>
  );
}
