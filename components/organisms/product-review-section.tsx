"use client";

import { useState } from "react";
import { StarRating } from "@/components/atoms/star-rating";
import { SectionTitle } from "@/components/atoms/section-title";
import type { ProductReview } from "@/data/product-reviews";

type Props = {
  sectionId?: string;
  review: ProductReview | null;
  isFrenchLocale?: boolean;
  title: string;
  emptyTitle?: string;
  emptyBody?: string;
};

export function ProductReviewSection({
  sectionId = "product-reviews",
  review,
  isFrenchLocale = false,
  title,
  emptyTitle,
  emptyBody,
}: Props) {
  const [showFrench, setShowFrench] = useState(false);
  const translatedReview = review
    ? showFrench && isFrenchLocale
      ? review.fr
      : review.en
    : null;

  return (
    <section
      id={sectionId}
      aria-label="Reviews"
      className="mt-12 border-t border-black/10 pt-8"
    >
      <SectionTitle>{title}</SectionTitle>
      <article className="mt-4 rounded-2xl border border-card-border bg-card p-5 shadow-sm">
        {review ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <StarRating rating={review.rating} ratingCount={1} showCount={false} />
              {isFrenchLocale ? (
                <button
                  type="button"
                  onClick={() => setShowFrench((v) => !v)}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {showFrench
                    ? "Afficher dans la langue originale (anglais)"
                    : "Traduire en français"}
                </button>
              ) : null}
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              {translatedReview?.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {translatedReview?.body}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-foreground">{emptyTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {emptyBody}
            </p>
          </>
        )}
      </article>
    </section>
  );
}
