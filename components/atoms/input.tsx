import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  invalid?: boolean;
};

export function Input({ invalid = false, ...props }: Props) {
  const base =
    "box-border min-h-11 w-full rounded-xl border bg-card px-3 py-2.5 text-base text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:ring-2";
  const state = invalid
    ? "border-red-600 focus-visible:border-red-600 focus-visible:ring-red-500"
    : "border-card-border focus-visible:border-primary focus-visible:ring-ring";
  return <input className={`${base} ${state}`} {...props} />;
}
