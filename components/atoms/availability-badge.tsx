import type { Availability } from "@/data/catalog";
import { availabilityPieFill } from "@/data/catalog";
import { AvailabilityPie } from "@/components/atoms/availability-pie";

type Props = { availability: Availability; label: string };

export function AvailabilityBadge({ availability, label }: Props) {
  const fill = availabilityPieFill(availability);

  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <AvailabilityPie fill={fill} />
      <span>{label}</span>
    </span>
  );
}
