"use client";

import { useTranslation } from "react-i18next";

type Props = {
  /** Average score 1.0–5.0 (decimals allowed). */
  rating: number;
  ratingCount: number;
  showCount?: boolean;
};

function starFill(rating: number, index: number): number {
  const r = Math.min(5, Math.max(0, rating));
  return Math.min(Math.max(r - index, 0), 1);
}

function StarSegment({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[1em] shrink-0 leading-none">
      <span className="text-muted-foreground/50" aria-hidden="true">
        ★
      </span>
      <span
        className="absolute inset-0 overflow-hidden text-amber-500"
        style={{ width: `${fill * 100}%` }}
        aria-hidden="true"
      >
        ★
      </span>
    </span>
  );
}

/** Display 1–5 average with fractional stars, numeric score, and rating count. */
export function StarRating({ rating, ratingCount, showCount = true }: Props) {
  const { t, i18n } = useTranslation("shop");
  const clamped = Math.min(5, Math.max(0, rating));
  const label =
    ratingCount === 1
      ? t("starRating.aria_one", {
          rating: clamped.toFixed(1),
          count: ratingCount.toLocaleString(i18n.language),
        })
      : t("starRating.aria", {
          rating: clamped.toFixed(1),
          count: ratingCount.toLocaleString(i18n.language),
        });

  return (
    <span
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm"
      role="img"
      aria-label={label}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <StarSegment key={i} fill={starFill(clamped, i)} />
        ))}
      </span>
      <span className="font-medium tabular-nums text-foreground">
        {clamped.toFixed(1)}
      </span>
      {showCount ? (
        <span className="text-muted-foreground">
          ({ratingCount.toLocaleString(i18n.language)}{" "}
          {t("starRating.suffix", {
            count: ratingCount,
          })})
        </span>
      ) : null}
    </span>
  );
}
