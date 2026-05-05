export type Category = "laptop" | "headset" | "usb-stick" | "bicycle";

/**
 * Availability for display and sorting (pedagogic demo).
 * — `available`: ships now.
 * — `restock`: known ETA in days or weeks (pie fill by urgency).
 * — `unavailable_unknown`: not orderable, no ETA (empty pie, no accent ring).
 */
export type Availability =
  | { kind: "available" }
  | { kind: "restock"; unit: "days" | "weeks"; amount: number }
  | { kind: "unavailable_unknown" };

/** Human-readable label (English). */
export function availabilityLabel(a: Availability): string {
  switch (a.kind) {
    case "available":
      return "Available";
    case "unavailable_unknown":
      return "Unavailable";
    case "restock":
      if (a.unit === "days") {
        const n = a.amount;
        return n === 1
          ? "Available in 1 day"
          : `Available in ${n} days`;
      }
      const w = a.amount;
      return w === 1
        ? "Available in 1 week"
        : `Available in ${w} weeks`;
  }
}

/** Approximate days until available; `null` when not applicable. */
export function availabilityApproxDays(a: Availability): number | null {
  if (a.kind !== "restock") return null;
  return a.unit === "days" ? a.amount : a.amount * 7;
}

/**
 * Pie fill (accent clockwise from top; remainder light grey).
 * Restock ETAs map to full / ¾ / ½ / ¼ by how soon stock arrives.
 */
export function availabilityPieFill(a: Availability): number {
  if (a.kind === "available") return 1;
  if (a.kind === "unavailable_unknown") return 0;
  const days = a.unit === "days" ? a.amount : a.amount * 7;
  if (days <= 3) return 0.75;
  if (days <= 14) return 0.5;
  return 0.25;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  category: Category;
  /** Price in CHF (francs). */
  priceChf: number;
  /** Average rating for display (1–5 stars). */
  ratingStars: number;
  availability: Availability;
  /** Fictional brand name for filtering (English, pedagogic demo). */
  brand: string;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  laptop: "Laptops",
  headset: "Headsets",
  "usb-stick": "USB sticks",
  bicycle: "Bicycles",
};

export const CATEGORIES: Category[] = [
  "laptop",
  "headset",
  "usb-stick",
  "bicycle",
];

export const products: Product[] = [
  {
    id: "lap-aurora-14",
    name: "AuroraBook 14",
    description:
      "Lightweight 14\" laptop for school with all-day battery, 16 GB RAM, and a comfortable keyboard.",
    category: "laptop",
    priceChf: 899,
    ratingStars: 5,
    availability: { kind: "available" },
    brand: "AuroraTech",
  },
  {
    id: "lap-summit-16",
    name: "Summit Pro 16",
    description:
      '16" display and fast SSD — great for projects that need a bit more screen space.',
    category: "laptop",
    priceChf: 1249.9,
    ratingStars: 4,
    availability: { kind: "restock", unit: "days", amount: 2 },
    brand: "Summit Labs",
  },
  {
    id: "lap-pocket-13",
    name: "PocketShell 13",
    description:
      "Compact everyday laptop with fingerprint reader and crisp anti-glare screen.",
    category: "laptop",
    priceChf: 729,
    ratingStars: 4,
    availability: { kind: "available" },
    brand: "PocketGear",
  },
  {
    id: "lap-studio-15",
    name: "StudioFlex 15",
    description:
      'Convertible 2-in-1 with stylus support and a vivid 15" touchscreen.',
    category: "laptop",
    priceChf: 1099,
    ratingStars: 3,
    availability: { kind: "unavailable_unknown" },
    brand: "StudioLine",
  },
  {
    id: "head-breeze",
    name: "Breeze ANC",
    description:
      "Over-ear headset with active noise cancellation and soft ear cushions.",
    category: "headset",
    priceChf: 189.95,
    ratingStars: 5,
    availability: { kind: "restock", unit: "days", amount: 3 },
    brand: "SoundWave",
  },
  {
    id: "head-pulse",
    name: "Pulse Air",
    description:
      "Lightweight on-ear headset with built-in mic — ideal for video calls.",
    category: "headset",
    priceChf: 79.5,
    ratingStars: 3,
    availability: { kind: "available" },
    brand: "Pulse Audio",
  },
  {
    id: "head-river",
    name: "River Buds",
    description:
      "True wireless earbuds with splash resistance and a compact charging case.",
    category: "headset",
    priceChf: 119,
    ratingStars: 4,
    availability: { kind: "available" },
    brand: "River Audio",
  },
  {
    id: "head-tide",
    name: "Tide Loop",
    description:
      "Behind-neck sport headset with flexible band and long battery life.",
    category: "headset",
    priceChf: 64.9,
    ratingStars: 2,
    availability: { kind: "unavailable_unknown" },
    brand: "Tide Gear",
  },
  {
    id: "usb-sprout-64",
    name: "Sprout 64 GB",
    description:
      "USB 3.2 stick with metal housing and a handy key-ring hole (64 GB).",
    category: "usb-stick",
    priceChf: 18.5,
    ratingStars: 4,
    availability: { kind: "available" },
    brand: "DataDash",
  },
  {
    id: "usb-nimble-128",
    name: "Nimble 128 GB",
    description:
      "Compact USB-C + USB-A dual connector stick — great for laptops and tablets (128 GB).",
    category: "usb-stick",
    priceChf: 34.9,
    ratingStars: 5,
    availability: { kind: "available" },
    brand: "Nimble",
  },
  {
    id: "usb-vault-256",
    name: "Vault 256 GB",
    description:
      "High-speed stick for large files, with sliding cap to protect the connector (256 GB).",
    category: "usb-stick",
    priceChf: 52,
    ratingStars: 3,
    availability: { kind: "restock", unit: "days", amount: 10 },
    brand: "Vault",
  },
  {
    id: "usb-pixel-32",
    name: "Pixel 32 GB",
    description:
      "Budget-friendly stick for documents and presentations (32 GB).",
    category: "usb-stick",
    priceChf: 9.95,
    ratingStars: 2,
    availability: { kind: "available" },
    brand: "Pixel Store",
  },
  {
    id: "bike-city-tour",
    name: "City Tour Classic",
    description:
      "Comfortable city bike with kickstand, lights, and 7-speed gearing.",
    category: "bicycle",
    priceChf: 649,
    ratingStars: 4,
    availability: { kind: "available" },
    brand: "UrbanRoll",
  },
  {
    id: "bike-trail-fox",
    name: "Trail Fox Hardtail",
    description:
      "Hardtail mountain bike with wide tires and sturdy front suspension.",
    category: "bicycle",
    priceChf: 879,
    ratingStars: 5,
    availability: { kind: "restock", unit: "weeks", amount: 2 },
    brand: "TrailCraft",
  },
  {
    id: "bike-fold-spark",
    name: "FoldSpark Mini",
    description:
      "Compact folding bike for multimodal trips — fits under a desk.",
    category: "bicycle",
    priceChf: 999,
    ratingStars: 3,
    availability: { kind: "available" },
    brand: "FoldSpark",
  },
  {
    id: "bike-ecom-glid",
    name: "GlideStep E-assist",
    description:
      "Pedal-assist e-bike for gentle hills, with removable battery.",
    category: "bicycle",
    priceChf: 2199,
    ratingStars: 5,
    availability: { kind: "unavailable_unknown" },
    brand: "EcoGlide",
  },
];

const byId = new Map(products.map((p) => [p.id, p]));

/** Catalog order index for stable “featured” / tie-breaking sorts. */
export function featuredIndexOf(productId: string): number {
  return products.findIndex((p) => p.id === productId);
}

/** Distinct brand names, sorted for dropdowns. */
export function getBrandOptions(): string[] {
  const set = new Set(products.map((p) => p.brand));
  return [...set].sort((a, b) => a.localeCompare(b, "en"));
}

export function getProductById(id: string): Product | undefined {
  return byId.get(id);
}

export function getProductsByCategory(category: Category | "all"): Product[] {
  if (category === "all") return [...products];
  return products.filter((p) => p.category === category);
}
