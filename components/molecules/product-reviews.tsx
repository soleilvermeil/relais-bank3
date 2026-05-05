"use client";

import { StarRating } from "@/components/atoms/star-rating";
import { useTranslation } from "react-i18next";

type Props = {
  rating: number;
  ratingCount: number;
  reviewSectionId?: string;
};

export function ProductReviews({
  rating,
  ratingCount,
  reviewSectionId = "product-reviews",
}: Props) {
  const { t, i18n } = useTranslation("shop");

  return (
    <div className="flex items-center gap-2 text-sm">
      <StarRating rating={rating} ratingCount={ratingCount} showCount={false} />
      <a
        href={`#${reviewSectionId}`}
        className="text-muted-foreground underline-offset-4 hover:underline"
      >
        ({ratingCount.toLocaleString(i18n.language)}{" "}
        {t("review.linkLabel", { count: ratingCount })})
      </a>
    </div>
  );
}
