import type { PickupStoreId } from "@/lib/shop-types";

export const PICKUP_STORES: { id: PickupStoreId; label: string }[] = [
  { id: "lausanne", label: "Lausanne — Avenue de la Gare 16" },
  { id: "geneve", label: "Genève — Route du Lac 12" },
  { id: "morges", label: "Morges — Avenue des Tulipes 60" },
];

export function getPickupLabel(id: PickupStoreId): string {
  return PICKUP_STORES.find((s) => s.id === id)?.label ?? id;
}
