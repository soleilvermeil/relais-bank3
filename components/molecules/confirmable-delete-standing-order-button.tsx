"use client";

import { Trash2 } from "lucide-react";

type Props = {
  label: string;
  confirmMessage: string;
};

export function ConfirmableDeleteStandingOrderButton({
  label,
  confirmMessage,
}: Props) {
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-card-border bg-muted px-5 py-2.5 text-base font-medium text-foreground transition hover:bg-card-border/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
    >
      <Trash2 className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}
