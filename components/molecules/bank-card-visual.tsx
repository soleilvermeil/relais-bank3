"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  pan: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  brand: string;
  cardType: "debit" | "credit";
  holderFirstName: string;
  holderLastName: string;
  labels: {
    reveal: string;
    hide: string;
    expiry: string;
    cvv: string;
    cardholder: string;
    debit: string;
    credit: string;
  };
};

function groupPan(pan: string): string {
  const groups: string[] = [];
  for (let i = 0; i < pan.length; i += 4) {
    groups.push(pan.slice(i, i + 4));
  }
  return groups.join(" ");
}

function maskPan(pan: string): string {
  const last4 = pan.slice(-4);
  return `XXXX XXXX XXXX ${last4}`;
}

function formatExpiry(month: number, year: number): string {
  const mm = String(month).padStart(2, "0");
  const yy = String(year).slice(-2);
  return `${mm}/${yy}`;
}

export function BankCardVisual({
  pan,
  expiryMonth,
  expiryYear,
  cvv,
  brand,
  cardType,
  holderFirstName,
  holderLastName,
  labels,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const toggleLabel = revealed ? labels.hide : labels.reveal;
  const typeLabel = cardType === "debit" ? labels.debit : labels.credit;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-[16/10] w-full max-w-sm overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-md sm:p-6"
        role="group"
        aria-label={`${typeLabel} ${brand}`}
      >
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
            {typeLabel}
          </p>
          <p className="text-sm font-bold tracking-wide">{brand}</p>
        </div>

        <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 sm:inset-x-6">
          <p
            className="font-mono text-lg tracking-[0.18em] sm:text-xl"
            aria-live="polite"
          >
            {revealed ? groupPan(pan) : maskPan(pan)}
          </p>
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
          <div className="min-w-0 space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider opacity-75">
              {labels.cardholder}
            </p>
            <p className="truncate text-sm font-medium">
              {holderFirstName} {holderLastName}
            </p>
          </div>
          <div className="flex shrink-0 gap-4 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-75">
                {labels.expiry}
              </p>
              <p className="font-mono text-sm font-medium">
                {formatExpiry(expiryMonth, expiryYear)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-75">
                {labels.cvv}
              </p>
              <p className="font-mono text-sm font-medium">
                {revealed ? cvv : "XXX"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRevealed((prev) => !prev)}
        aria-pressed={revealed}
        className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-card-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
      >
        {revealed ? (
          <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {toggleLabel}
      </button>
    </div>
  );
}
