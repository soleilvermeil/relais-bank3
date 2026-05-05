import { formatChf } from "@/lib/format-money";

type Props = { amount: number; "aria-label"?: string; className?: string };

export function Price({ amount, "aria-label": ariaLabel, className }: Props) {
  const text = formatChf(amount);
  return (
    <span
      className={className ?? "tabular-nums font-semibold text-primary"}
      aria-label={ariaLabel ?? `Price ${text}`}
    >
      {text}
    </span>
  );
}
