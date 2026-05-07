import type { SelectHTMLAttributes } from "react";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  invalid?: boolean;
};

export function Select({ invalid = false, ...props }: Props) {
  const base =
    "box-border min-h-11 w-full rounded-xl border bg-card px-3 py-2.5 text-base text-foreground shadow-inner focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";
  const state = invalid
    ? "border-red-600 focus-visible:border-red-600 focus-visible:ring-red-500"
    : "border-card-border focus-visible:border-primary focus-visible:ring-ring";
  return (
    <select
      className={`${base} ${state}`}
      {...props}
    />
  );
}
