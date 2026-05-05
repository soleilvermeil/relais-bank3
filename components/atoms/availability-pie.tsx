/** Track color: light neutral grey so the “empty” sector is visible, not transparent. */
const PIE_TRACK = "#d4d4d8";

type Props = {
  /** Filled fraction clockwise from the top (0 = all track, 1 = full accent). */
  fill: number;
};

export function AvailabilityPie({ fill }: Props) {
  const f = Math.min(1, Math.max(0, fill));
  const pct = `${f * 100}%`;
  const showAccentRing = f > 0;

  return (
    <span
      aria-hidden
      className={
        showAccentRing
          ? "inline-block size-3 shrink-0 rounded-full shadow-inner"
          : "inline-block size-3 shrink-0 rounded-full border border-[#d4d4d8] shadow-inner"
      }
      style={{
        background: `conic-gradient(from 0deg, var(--availability-pie-accent) 0% ${pct}, ${PIE_TRACK} ${pct} 100%)`,
        boxShadow: showAccentRing
          ? "0 0 0 1px var(--availability-pie-accent)"
          : undefined,
      }}
    />
  );
}
