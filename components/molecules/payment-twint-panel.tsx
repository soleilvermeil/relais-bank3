"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";

type Props = { pending: boolean };

/**
 * No real QR: learners tap the button to continue as if payment in TWINT was completed.
 */
export function PaymentTwintPanel({ pending }: Props) {
  const { t } = useTranslation("shop");
  return (
    <div className="rounded-2xl border border-card-border bg-gradient-to-b from-muted to-card p-4 sm:p-6">
      <h3 className="text-base font-semibold text-foreground">
        {t("payment.twint.title")}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("payment.twint.body")}
      </p>
      <div
        className="relative mx-auto mt-6 flex max-w-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-card-border bg-background p-6 text-center shadow-inner"
        aria-hidden="true"
      >
        <div
          className="grid h-28 w-28 grid-cols-6 gap-0.5 opacity-40"
          role="img"
          aria-label={t("payment.twint.qrAria")}
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`rounded-sm ${
                (i + (i >> 2)) % 3 === 0 ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {t("payment.twint.qrCaption")}
        </p>
      </div>
      <p className="mt-6 text-sm text-foreground">
        {t("payment.twint.hint")}
      </p>
      <div className="mt-4">
        <Button type="submit" disabled={pending} wide>
          {pending ? t("payment.savePending") : t("payment.twint.done")}
        </Button>
      </div>
    </div>
  );
}
