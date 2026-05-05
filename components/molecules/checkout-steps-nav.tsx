"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export type CheckoutStepId = "delivery" | "payment" | "summary";

type Props = { current: CheckoutStepId };

export function CheckoutStepsNav({ current }: Props) {
  const { t } = useTranslation("shop");
  const steps: { id: CheckoutStepId; labelKey: string; href: string }[] = [
    { id: "delivery", labelKey: "checkout.stepDelivery", href: "/checkout/delivery" },
    { id: "payment", labelKey: "checkout.stepPayment", href: "/checkout/payment" },
    { id: "summary", labelKey: "checkout.stepSummary", href: "/checkout/summary" },
  ];
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <ol
      aria-label={t("checkout.stepsNav")}
      className="mb-8 flex flex-wrap items-center gap-2 text-sm"
    >
      {steps.map((step, index) => {
        const isCurrent = step.id === current;
        const isPast = index < currentIndex;
        const label = t(step.labelKey);
        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-card-border">
                →
              </span>
            ) : null}
            {isCurrent ? (
              <span
                className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground"
                aria-current="step"
              >
                {index + 1}. {label}
              </span>
            ) : isPast ? (
              <Link
                href={step.href}
                className="rounded-full bg-muted px-3 py-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {index + 1}. {label}
              </Link>
            ) : (
              <span className="rounded-full border border-dashed border-card-border px-3 py-1 text-muted-foreground">
                {index + 1}. {label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
