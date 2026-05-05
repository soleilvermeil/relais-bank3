import Link from "next/link";
import type { Product } from "@/data/catalog";
import type { ProductPricing } from "@/data/catalog";
import { AvailabilityBadge } from "@/components/atoms/availability-badge";
import { Badge } from "@/components/atoms/badge";
import { Price } from "@/components/atoms/price";
import { StarRating } from "@/components/atoms/star-rating";

function categoryEmoji(category: Product["category"]) {
  switch (category) {
    case "laptop":
      return "💻";
    case "headset":
      return "🎧";
    case "usb-stick":
      return "📥";
    case "bicycle":
      return "🚲";
    case "coffee":
      return "☕";
    case "rice":
      return "🍚";
    case "potato":
      return "🥔";
    case "milk":
      return "🥛";
    case "plain-yogurt":
      return "🥣";
    case "tomato":
      return "🍅";
    default:
      return "🛒";
  }
}

type Props = {
  product: Product;
  pricing: ProductPricing;
  title: string;
  description: string;
  categoryLabel: string;
  availabilityLabel: string;
  viewDetails: string;
  viewDetailsAria: string;
  discountLabel: string;
  originalPriceLabel: string;
};

export function ProductCard({
  product,
  pricing,
  title,
  description,
  categoryLabel,
  availabilityLabel,
  viewDetails,
  viewDetailsAria,
  discountLabel,
  originalPriceLabel,
}: Props) {
  const href = `/products/${product.id}`;
  const hasDiscount = pricing.discountRate > 0;

  return (
    <article className="relative flex h-full flex-row overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm transition hover:shadow-md sm:flex-col">
      <Link
        href={href}
        className="absolute inset-0 z-10 rounded-2xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={viewDetailsAria}
      />
      <div className="flex w-28 shrink-0 items-center justify-center bg-muted text-5xl sm:w-full sm:aspect-[4/3]">
        <span aria-hidden="true">{categoryEmoji(product.category)}</span>
      </div>
      <div className="relative z-0 flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{categoryLabel}</Badge>
          {hasDiscount ? (
            <span className="inline-flex items-center rounded-full bg-orange-700/80 px-2.5 py-0.5 text-xs font-medium text-white">
              {discountLabel}
            </span>
          ) : null}
          <AvailabilityBadge
            availability={product.availability}
            label={availabilityLabel}
          />
        </div>
        <div className="flex items-center gap-2">
          <StarRating
            rating={product.averageRating}
            ratingCount={product.ratingCount}
          />
        </div>
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {title}
        </h3>
        <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
        {description ? (
          <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
            {description}
          </p>
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:gap-2">
            {hasDiscount ? (
              <Price
                amount={pricing.basePriceChf}
                aria-label={originalPriceLabel}
                className="text-sm text-muted-foreground line-through"
              />
            ) : null}
            <Price amount={pricing.discountedPriceChf} />
          </div>
          <span
            className="text-sm font-medium text-primary"
            aria-hidden="true"
          >
            {viewDetails}
          </span>
        </div>
      </div>
    </article>
  );
}
