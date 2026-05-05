/**
 * Pedagogic catalog: each category has four fictional brands with three articles each
 * (12 products per category). Quality and price vary within a brand so choices are not
 * purely “cheap vs expensive” or “good vs bad” binary:
 *   • Laptops & USB sticks: mix of budget, premium, and mid-tier lines.
 *   • Headsets & bicycles: reputation and segment vary; mid brands add “good enough” and mixed picks.
 *   • Pantry & fresh food: four price tiers with overlapping ratings and certifications.
 *
 * Product names and descriptions live in locales/{en,fr}/catalog.json (i18n namespace "catalog").
 */

export type Category =
  | "laptop"
  | "headset"
  | "usb-stick"
  | "bicycle"
  | "coffee"
  | "rice"
  | "potato"
  | "milk"
  | "plain-yogurt"
  | "tomato";

export type MacroCategory =
  | "electronics"
  | "sports-outdoors"
  | "pantry"
  | "fresh-food";

export type Availability =
  | { kind: "available" }
  | { kind: "restock"; unit: "days" | "weeks"; amount: number }
  | { kind: "unavailable_unknown" };

export function availabilityApproxDays(a: Availability): number | null {
  if (a.kind !== "restock") return null;
  return a.unit === "days" ? a.amount : a.amount * 7;
}

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
  category: Category;
  priceChf: number;
  /** Customer average 1.0–5.0 (may include decimals). */
  averageRating: number;
  /** Number of ratings included in `averageRating`. */
  ratingCount: number;
  availability: Availability;
  brand: string;
};

export type ProductPricing = {
  basePriceChf: number;
  discountRate: number;
  discountedPriceChf: number;
};

export const CATEGORIES: Category[] = [
  "laptop",
  "headset",
  "usb-stick",
  "bicycle",
  "coffee",
  "rice",
  "potato",
  "milk",
  "plain-yogurt",
  "tomato",
];

export const MACRO_CATEGORIES: MacroCategory[] = [
  "electronics",
  "sports-outdoors",
  "pantry",
  "fresh-food",
];

const subcategoriesByMacroCategory: Record<MacroCategory, Category[]> = {
  electronics: ["laptop", "headset", "usb-stick"],
  "sports-outdoors": ["bicycle"],
  pantry: ["coffee", "rice"],
  "fresh-food": ["potato", "milk", "plain-yogurt", "tomato"],
};

export const products: Product[] = [
  // —— Laptops: ChipNest, NovaForge, VoltEdge, LuminaKey ——
  {
    id: "lap-chipnest-student-14",
    category: "laptop",
    priceChf: 589,
    averageRating: 4.6,
    ratingCount: 842,
    availability: { kind: "available" },
    brand: "ChipNest",
  },
  {
    id: "lap-chipnest-basic-15",
    category: "laptop",
    priceChf: 449,
    averageRating: 1.9,
    ratingCount: 156,
    availability: { kind: "available" },
    brand: "ChipNest",
  },
  {
    id: "lap-chipnest-flex-14",
    category: "laptop",
    priceChf: 519,
    averageRating: 3.5,
    ratingCount: 412,
    availability: { kind: "restock", unit: "days", amount: 5 },
    brand: "ChipNest",
  },
  {
    id: "lap-novaforge-pro-16",
    category: "laptop",
    priceChf: 1999,
    averageRating: 4.8,
    ratingCount: 412,
    availability: { kind: "restock", unit: "days", amount: 4 },
    brand: "NovaForge",
  },
  {
    id: "lap-novaforge-studio-air",
    category: "laptop",
    priceChf: 1699,
    averageRating: 2.4,
    ratingCount: 97,
    availability: { kind: "unavailable_unknown" },
    brand: "NovaForge",
  },
  {
    id: "lap-novaforge-everyday-14",
    category: "laptop",
    priceChf: 1349,
    averageRating: 3.7,
    ratingCount: 188,
    availability: { kind: "available" },
    brand: "NovaForge",
  },
  {
    id: "lap-voltedge-zen-15",
    category: "laptop",
    priceChf: 949,
    averageRating: 4.3,
    ratingCount: 520,
    availability: { kind: "available" },
    brand: "VoltEdge",
  },
  {
    id: "lap-voltedge-work-15",
    category: "laptop",
    priceChf: 799,
    averageRating: 2.8,
    ratingCount: 94,
    availability: { kind: "available" },
    brand: "VoltEdge",
  },
  {
    id: "lap-voltedge-lite-14",
    category: "laptop",
    priceChf: 679,
    averageRating: 3.4,
    ratingCount: 201,
    availability: { kind: "restock", unit: "days", amount: 3 },
    brand: "VoltEdge",
  },
  {
    id: "lap-luminakey-show-16",
    category: "laptop",
    priceChf: 1549,
    averageRating: 4.5,
    ratingCount: 167,
    availability: { kind: "available" },
    brand: "LuminaKey",
  },
  {
    id: "lap-luminakey-glide-13",
    category: "laptop",
    priceChf: 1049,
    averageRating: 2.6,
    ratingCount: 73,
    availability: { kind: "unavailable_unknown" },
    brand: "LuminaKey",
  },
  {
    id: "lap-luminakey-pulse-14",
    category: "laptop",
    priceChf: 1189,
    averageRating: 4.0,
    ratingCount: 290,
    availability: { kind: "available" },
    brand: "LuminaKey",
  },

  // —— Headsets: Auricle, TinBuzz, SoundWeave, PulseLine ——
  {
    id: "hea-auricle-go-wired",
    category: "headset",
    priceChf: 59.9,
    averageRating: 4.5,
    ratingCount: 2103,
    availability: { kind: "available" },
    brand: "Auricle",
  },
  {
    id: "hea-auricle-quiet-pro",
    category: "headset",
    priceChf: 279,
    averageRating: 4.7,
    ratingCount: 3840,
    availability: { kind: "available" },
    brand: "Auricle",
  },
  {
    id: "hea-auricle-desk-one",
    category: "headset",
    priceChf: 99,
    averageRating: 3.9,
    ratingCount: 890,
    availability: { kind: "restock", unit: "days", amount: 2 },
    brand: "Auricle",
  },
  {
    id: "hea-tinbuzz-pocket",
    category: "headset",
    priceChf: 44.5,
    averageRating: 2.2,
    ratingCount: 512,
    availability: { kind: "restock", unit: "days", amount: 2 },
    brand: "TinBuzz",
  },
  {
    id: "hea-tinbuzz-elite-900",
    category: "headset",
    priceChf: 249,
    averageRating: 1.8,
    ratingCount: 88,
    availability: { kind: "unavailable_unknown" },
    brand: "TinBuzz",
  },
  {
    id: "hea-tinbuzz-wire-one",
    category: "headset",
    priceChf: 34.9,
    averageRating: 2.6,
    ratingCount: 340,
    availability: { kind: "available" },
    brand: "TinBuzz",
  },
  {
    id: "hea-soundweave-open-60",
    category: "headset",
    priceChf: 69,
    averageRating: 4.2,
    ratingCount: 445,
    availability: { kind: "available" },
    brand: "SoundWeave",
  },
  {
    id: "hea-soundweave-pod-air",
    category: "headset",
    priceChf: 54,
    averageRating: 3.1,
    ratingCount: 120,
    availability: { kind: "available" },
    brand: "SoundWeave",
  },
  {
    id: "hea-soundweave-bass-hd",
    category: "headset",
    priceChf: 119,
    averageRating: 2.3,
    ratingCount: 67,
    availability: { kind: "restock", unit: "weeks", amount: 1 },
    brand: "SoundWeave",
  },
  {
    id: "hea-pulseline-fit-s",
    category: "headset",
    priceChf: 72,
    averageRating: 4.4,
    ratingCount: 1500,
    availability: { kind: "available" },
    brand: "PulseLine",
  },
  {
    id: "hea-pulseline-office",
    category: "headset",
    priceChf: 58,
    averageRating: 3.5,
    ratingCount: 280,
    availability: { kind: "available" },
    brand: "PulseLine",
  },
  {
    id: "hea-pulseline-anc-go",
    category: "headset",
    priceChf: 95,
    averageRating: 2.0,
    ratingCount: 45,
    availability: { kind: "available" },
    brand: "PulseLine",
  },

  // —— USB sticks: QuickByte, Arkive, DataRiver, NeoVault ——
  {
    id: "usb-quickbyte-flash-128",
    category: "usb-stick",
    priceChf: 18.9,
    averageRating: 4.4,
    ratingCount: 672,
    availability: { kind: "available" },
    brand: "QuickByte",
  },
  {
    id: "usb-quickbyte-economy-32",
    category: "usb-stick",
    priceChf: 8.9,
    averageRating: 2.0,
    ratingCount: 1240,
    availability: { kind: "available" },
    brand: "QuickByte",
  },
  {
    id: "usb-quickbyte-pro-64",
    category: "usb-stick",
    priceChf: 14.5,
    averageRating: 3.8,
    ratingCount: 890,
    availability: { kind: "restock", unit: "days", amount: 4 },
    brand: "QuickByte",
  },
  {
    id: "usb-arkive-titanium-512",
    category: "usb-stick",
    priceChf: 84.5,
    averageRating: 4.6,
    ratingCount: 305,
    availability: { kind: "restock", unit: "weeks", amount: 1 },
    brand: "Arkive",
  },
  {
    id: "usb-arkive-slim-256",
    category: "usb-stick",
    priceChf: 62,
    averageRating: 2.3,
    ratingCount: 42,
    availability: { kind: "restock", unit: "days", amount: 6 },
    brand: "Arkive",
  },
  {
    id: "usb-arkive-desk-128",
    category: "usb-stick",
    priceChf: 48,
    averageRating: 3.6,
    ratingCount: 112,
    availability: { kind: "available" },
    brand: "Arkive",
  },
  {
    id: "usb-datariver-swift-128",
    category: "usb-stick",
    priceChf: 22,
    averageRating: 4.1,
    ratingCount: 334,
    availability: { kind: "available" },
    brand: "DataRiver",
  },
  {
    id: "usb-datariver-go-32",
    category: "usb-stick",
    priceChf: 11.9,
    averageRating: 2.7,
    ratingCount: 521,
    availability: { kind: "available" },
    brand: "DataRiver",
  },
  {
    id: "usb-datariver-max-256",
    category: "usb-stick",
    priceChf: 38,
    averageRating: 3.9,
    ratingCount: 156,
    availability: { kind: "restock", unit: "days", amount: 5 },
    brand: "DataRiver",
  },
  {
    id: "usb-neovault-shield-128",
    category: "usb-stick",
    priceChf: 32,
    averageRating: 4.0,
    ratingCount: 98,
    availability: { kind: "available" },
    brand: "NeoVault",
  },
  {
    id: "usb-neovault-micro-64",
    category: "usb-stick",
    priceChf: 24,
    averageRating: 2.4,
    ratingCount: 203,
    availability: { kind: "available" },
    brand: "NeoVault",
  },
  {
    id: "usb-neovault-twin-256",
    category: "usb-stick",
    priceChf: 55,
    averageRating: 3.2,
    ratingCount: 41,
    availability: { kind: "unavailable_unknown" },
    brand: "NeoVault",
  },

  // —— Bicycles: SmoothRoll, CreakWheel, NorthSpan, GridLine ——
  {
    id: "bik-smoothroll-commuter-7",
    category: "bicycle",
    priceChf: 699,
    averageRating: 4.5,
    ratingCount: 556,
    availability: { kind: "available" },
    brand: "SmoothRoll",
  },
  {
    id: "bik-smoothroll-gravel-x",
    category: "bicycle",
    priceChf: 2399,
    averageRating: 4.9,
    ratingCount: 178,
    availability: { kind: "restock", unit: "days", amount: 7 },
    brand: "SmoothRoll",
  },
  {
    id: "bik-smoothroll-city-lite",
    category: "bicycle",
    priceChf: 799,
    averageRating: 4.2,
    ratingCount: 189,
    availability: { kind: "available" },
    brand: "SmoothRoll",
  },
  {
    id: "bik-creakwheel-street",
    category: "bicycle",
    priceChf: 549,
    averageRating: 2.1,
    ratingCount: 203,
    availability: { kind: "available" },
    brand: "CreakWheel",
  },
  {
    id: "bik-creakwheel-carbon-air",
    category: "bicycle",
    priceChf: 2199,
    averageRating: 1.5,
    ratingCount: 31,
    availability: { kind: "unavailable_unknown" },
    brand: "CreakWheel",
  },
  {
    id: "bik-creakwheel-path-8",
    category: "bicycle",
    priceChf: 629,
    averageRating: 2.4,
    ratingCount: 88,
    availability: { kind: "available" },
    brand: "CreakWheel",
  },
  {
    id: "bik-northspan-tour-9",
    category: "bicycle",
    priceChf: 1199,
    averageRating: 4.1,
    ratingCount: 134,
    availability: { kind: "available" },
    brand: "NorthSpan",
  },
  {
    id: "bik-northspan-kids-24",
    category: "bicycle",
    priceChf: 389,
    averageRating: 3.8,
    ratingCount: 267,
    availability: { kind: "available" },
    brand: "NorthSpan",
  },
  {
    id: "bik-northspan-trail-10",
    category: "bicycle",
    priceChf: 1499,
    averageRating: 2.9,
    ratingCount: 56,
    availability: { kind: "restock", unit: "days", amount: 10 },
    brand: "NorthSpan",
  },
  {
    id: "bik-gridline-fix-one",
    category: "bicycle",
    priceChf: 499,
    averageRating: 3.6,
    ratingCount: 412,
    availability: { kind: "available" },
    brand: "GridLine",
  },
  {
    id: "bik-gridline-fold-lite",
    category: "bicycle",
    priceChf: 899,
    averageRating: 3.2,
    ratingCount: 178,
    availability: { kind: "available" },
    brand: "GridLine",
  },
  {
    id: "bik-gridline-speed-11",
    category: "bicycle",
    priceChf: 1899,
    averageRating: 4.2,
    ratingCount: 91,
    availability: { kind: "restock", unit: "weeks", amount: 1 },
    brand: "GridLine",
  },

  // —— Coffee: BeanTrail, MontCrest, SunriseRoast, CoastalCup ——
  {
    id: "cof-beantrail-ground-250",
    category: "coffee",
    priceChf: 4.8,
    averageRating: 4.2,
    ratingCount: 318,
    availability: { kind: "available" },
    brand: "BeanTrail",
  },
  {
    id: "cof-beantrail-ground-500",
    category: "coffee",
    priceChf: 8.9,
    averageRating: 4.3,
    ratingCount: 256,
    availability: { kind: "available" },
    brand: "BeanTrail",
  },
  {
    id: "cof-beantrail-instant-200",
    category: "coffee",
    priceChf: 3.9,
    averageRating: 2.8,
    ratingCount: 890,
    availability: { kind: "available" },
    brand: "BeanTrail",
  },
  {
    id: "cof-montcrest-whole-250",
    category: "coffee",
    priceChf: 9.9,
    averageRating: 4.6,
    ratingCount: 221,
    availability: { kind: "restock", unit: "days", amount: 3 },
    brand: "MontCrest",
  },
  {
    id: "cof-montcrest-whole-1kg",
    category: "coffee",
    priceChf: 34.9,
    averageRating: 4.7,
    ratingCount: 164,
    availability: { kind: "restock", unit: "weeks", amount: 1 },
    brand: "MontCrest",
  },
  {
    id: "cof-montcrest-espresso-500",
    category: "coffee",
    priceChf: 16.9,
    averageRating: 4.35,
    ratingCount: 201,
    availability: { kind: "available" },
    brand: "MontCrest",
  },
  {
    id: "cof-sunrise-house-400",
    category: "coffee",
    priceChf: 11.5,
    averageRating: 4.45,
    ratingCount: 156,
    availability: { kind: "available" },
    brand: "SunriseRoast",
  },
  {
    id: "cof-sunrise-moka-250",
    category: "coffee",
    priceChf: 6.8,
    averageRating: 2.4,
    ratingCount: 89,
    availability: { kind: "available" },
    brand: "SunriseRoast",
  },
  {
    id: "cof-sunrise-filter-1kg",
    category: "coffee",
    priceChf: 24.9,
    averageRating: 3.6,
    ratingCount: 112,
    availability: { kind: "restock", unit: "days", amount: 4 },
    brand: "SunriseRoast",
  },
  {
    id: "cof-coastalcup-classic-500",
    category: "coffee",
    priceChf: 5.5,
    averageRating: 3.9,
    ratingCount: 445,
    availability: { kind: "available" },
    brand: "CoastalCup",
  },
  {
    id: "cof-coastalcup-dark-1kg",
    category: "coffee",
    priceChf: 11.9,
    averageRating: 2.1,
    ratingCount: 78,
    availability: { kind: "available" },
    brand: "CoastalCup",
  },
  {
    id: "cof-coastalcup-pods-10",
    category: "coffee",
    priceChf: 4.8,
    averageRating: 3.4,
    ratingCount: 334,
    availability: { kind: "available" },
    brand: "CoastalCup",
  },

  // —— Rice: GrainField, RizRoyal, HarborRice, SummitGrain ——
  {
    id: "ric-grainfield-long-1kg",
    category: "rice",
    priceChf: 3.6,
    averageRating: 4.2,
    ratingCount: 489,
    availability: { kind: "available" },
    brand: "GrainField",
  },
  {
    id: "ric-grainfield-long-2kg",
    category: "rice",
    priceChf: 6.7,
    averageRating: 4.2,
    ratingCount: 304,
    availability: { kind: "available" },
    brand: "GrainField",
  },
  {
    id: "ric-grainfield-sushi-500",
    category: "rice",
    priceChf: 2.2,
    averageRating: 3.7,
    ratingCount: 234,
    availability: { kind: "available" },
    brand: "GrainField",
  },
  {
    id: "ric-rizroyal-basmati-1kg",
    category: "rice",
    priceChf: 6.9,
    averageRating: 4.5,
    ratingCount: 276,
    availability: { kind: "available" },
    brand: "RizRoyal",
  },
  {
    id: "ric-rizroyal-basmati-5kg",
    category: "rice",
    priceChf: 29.9,
    averageRating: 4.6,
    ratingCount: 145,
    availability: { kind: "restock", unit: "days", amount: 5 },
    brand: "RizRoyal",
  },
  {
    id: "ric-rizroyal-jasmine-2kg",
    category: "rice",
    priceChf: 24.9,
    averageRating: 4.55,
    ratingCount: 98,
    availability: { kind: "available" },
    brand: "RizRoyal",
  },
  {
    id: "ric-harbor-arborio-1kg",
    category: "rice",
    priceChf: 5.9,
    averageRating: 4.2,
    ratingCount: 167,
    availability: { kind: "available" },
    brand: "HarborRice",
  },
  {
    id: "ric-harbor-wild-500",
    category: "rice",
    priceChf: 7.8,
    averageRating: 2.5,
    ratingCount: 45,
    availability: { kind: "available" },
    brand: "HarborRice",
  },
  {
    id: "ric-harbor-blend-2kg",
    category: "rice",
    priceChf: 9.4,
    averageRating: 3.5,
    ratingCount: 112,
    availability: { kind: "restock", unit: "days", amount: 6 },
    brand: "HarborRice",
  },
  {
    id: "ric-summit-brown-1kg",
    category: "rice",
    priceChf: 4.8,
    averageRating: 4.3,
    ratingCount: 189,
    availability: { kind: "available" },
    brand: "SummitGrain",
  },
  {
    id: "ric-summit-white-5kg",
    category: "rice",
    priceChf: 18.5,
    averageRating: 2.8,
    ratingCount: 56,
    availability: { kind: "available" },
    brand: "SummitGrain",
  },
  {
    id: "ric-summit-red-1kg",
    category: "rice",
    priceChf: 5.2,
    averageRating: 3.9,
    ratingCount: 203,
    availability: { kind: "available" },
    brand: "SummitGrain",
  },

  // —— Potatoes: TerreSimple, AlpHarvest, SoilMark, Valdor ——
  {
    id: "pot-terresimple-waxy-1kg",
    category: "potato",
    priceChf: 2.6,
    averageRating: 4.1,
    ratingCount: 418,
    availability: { kind: "available" },
    brand: "TerreSimple",
  },
  {
    id: "pot-terresimple-waxy-2kg",
    category: "potato",
    priceChf: 4.9,
    averageRating: 4.2,
    ratingCount: 251,
    availability: { kind: "available" },
    brand: "TerreSimple",
  },
  {
    id: "pot-terresimple-firm-1kg",
    category: "potato",
    priceChf: 2.85,
    averageRating: 4.0,
    ratingCount: 156,
    availability: { kind: "available" },
    brand: "TerreSimple",
  },
  {
    id: "pot-alpharvest-firm-1kg",
    category: "potato",
    priceChf: 4.7,
    averageRating: 4.5,
    ratingCount: 197,
    availability: { kind: "available" },
    brand: "AlpHarvest",
  },
  {
    id: "pot-alpharvest-firm-2_5kg",
    category: "potato",
    priceChf: 10.9,
    averageRating: 4.6,
    ratingCount: 132,
    availability: { kind: "restock", unit: "days", amount: 4 },
    brand: "AlpHarvest",
  },
  {
    id: "pot-alpharvest-waxy-2kg",
    category: "potato",
    priceChf: 9.2,
    averageRating: 4.5,
    ratingCount: 98,
    availability: { kind: "available" },
    brand: "AlpHarvest",
  },
  {
    id: "pot-soilmark-mixed-1_5kg",
    category: "potato",
    priceChf: 4.1,
    averageRating: 3.7,
    ratingCount: 145,
    availability: { kind: "available" },
    brand: "SoilMark",
  },
  {
    id: "pot-soilmark-baby-500",
    category: "potato",
    priceChf: 3.5,
    averageRating: 2.6,
    ratingCount: 67,
    availability: { kind: "available" },
    brand: "SoilMark",
  },
  {
    id: "pot-soilmark-bake-2kg",
    category: "potato",
    priceChf: 5.8,
    averageRating: 4.1,
    ratingCount: 201,
    availability: { kind: "restock", unit: "days", amount: 2 },
    brand: "SoilMark",
  },
  {
    id: "pot-valdor-red-1kg",
    category: "potato",
    priceChf: 5.2,
    averageRating: 4.4,
    ratingCount: 134,
    availability: { kind: "available" },
    brand: "Valdor",
  },
  {
    id: "pot-valdor-tier-2_5kg",
    category: "potato",
    priceChf: 11.5,
    averageRating: 2.7,
    ratingCount: 41,
    availability: { kind: "available" },
    brand: "Valdor",
  },
  {
    id: "pot-valdor-salad-750",
    category: "potato",
    priceChf: 4.8,
    averageRating: 3.8,
    ratingCount: 178,
    availability: { kind: "available" },
    brand: "Valdor",
  },

  // —— Milk: AlpDaily, MontLait, RiverMead, PeakCrest ——
  {
    id: "mlk-alpdaily-uht-1l",
    category: "milk",
    priceChf: 1.5,
    averageRating: 4.2,
    ratingCount: 763,
    availability: { kind: "available" },
    brand: "AlpDaily",
  },
  {
    id: "mlk-alpdaily-uht-1_5l",
    category: "milk",
    priceChf: 2.1,
    averageRating: 4.2,
    ratingCount: 402,
    availability: { kind: "available" },
    brand: "AlpDaily",
  },
  {
    id: "mlk-alpdaily-skim-1l",
    category: "milk",
    priceChf: 1.45,
    averageRating: 4.0,
    ratingCount: 334,
    availability: { kind: "available" },
    brand: "AlpDaily",
  },
  {
    id: "mlk-montlait-fresh-1l",
    category: "milk",
    priceChf: 2.8,
    averageRating: 4.6,
    ratingCount: 338,
    availability: { kind: "available" },
    brand: "MontLait",
  },
  {
    id: "mlk-montlait-fresh-2l",
    category: "milk",
    priceChf: 5.4,
    averageRating: 4.7,
    ratingCount: 196,
    availability: { kind: "restock", unit: "days", amount: 2 },
    brand: "MontLait",
  },
  {
    id: "mlk-montlait-barista-1l",
    category: "milk",
    priceChf: 3.9,
    averageRating: 4.55,
    ratingCount: 156,
    availability: { kind: "available" },
    brand: "MontLait",
  },
  {
    id: "mlk-rivermead-semi-1l",
    category: "milk",
    priceChf: 2.2,
    averageRating: 3.6,
    ratingCount: 267,
    availability: { kind: "available" },
    brand: "RiverMead",
  },
  {
    id: "mlk-rivermead-choco-500",
    category: "milk",
    priceChf: 2.5,
    averageRating: 2.4,
    ratingCount: 445,
    availability: { kind: "available" },
    brand: "RiverMead",
  },
  {
    id: "mlk-rivermead-oat-1l",
    category: "milk",
    priceChf: 2.9,
    averageRating: 4.2,
    ratingCount: 189,
    availability: { kind: "available" },
    brand: "RiverMead",
  },
  {
    id: "mlk-peakcrest-grass-1l",
    category: "milk",
    priceChf: 3.6,
    averageRating: 4.65,
    ratingCount: 223,
    availability: { kind: "available" },
    brand: "PeakCrest",
  },
  {
    id: "mlk-peakcrest-uht-2l",
    category: "milk",
    priceChf: 4.5,
    averageRating: 2.9,
    ratingCount: 98,
    availability: { kind: "restock", unit: "days", amount: 3 },
    brand: "PeakCrest",
  },
  {
    id: "mlk-peakcrest-lacto-1l",
    category: "milk",
    priceChf: 2.8,
    averageRating: 3.5,
    ratingCount: 167,
    availability: { kind: "available" },
    brand: "PeakCrest",
  },

  // —— Plain yogurt: DairyJoy, CremaNoble, AlpineCream, SwissFold ——
  {
    id: "yog-dairyjoy-plain-180",
    category: "plain-yogurt",
    priceChf: 0.95,
    averageRating: 4.2,
    ratingCount: 519,
    availability: { kind: "available" },
    brand: "DairyJoy",
  },
  {
    id: "yog-dairyjoy-plain-500",
    category: "plain-yogurt",
    priceChf: 2.2,
    averageRating: 4.3,
    ratingCount: 287,
    availability: { kind: "available" },
    brand: "DairyJoy",
  },
  {
    id: "yog-dairyjoy-greek-400",
    category: "plain-yogurt",
    priceChf: 2.8,
    averageRating: 4.0,
    ratingCount: 178,
    availability: { kind: "available" },
    brand: "DairyJoy",
  },
  {
    id: "yog-cremanoble-plain-180",
    category: "plain-yogurt",
    priceChf: 1.7,
    averageRating: 4.6,
    ratingCount: 261,
    availability: { kind: "available" },
    brand: "CremaNoble",
  },
  {
    id: "yog-cremanoble-plain-1kg",
    category: "plain-yogurt",
    priceChf: 7.9,
    averageRating: 4.7,
    ratingCount: 154,
    availability: { kind: "restock", unit: "days", amount: 3 },
    brand: "CremaNoble",
  },
  {
    id: "yog-cremanoble-greek-500",
    category: "plain-yogurt",
    priceChf: 5.9,
    averageRating: 4.55,
    ratingCount: 134,
    availability: { kind: "available" },
    brand: "CremaNoble",
  },
  {
    id: "yog-alpinecream-mountain-400",
    category: "plain-yogurt",
    priceChf: 3.5,
    averageRating: 4.35,
    ratingCount: 112,
    availability: { kind: "available" },
    brand: "AlpineCream",
  },
  {
    id: "yog-alpinecream-bio-1kg",
    category: "plain-yogurt",
    priceChf: 6.8,
    averageRating: 2.6,
    ratingCount: 56,
    availability: { kind: "available" },
    brand: "AlpineCream",
  },
  {
    id: "yog-alpinecream-light-600",
    category: "plain-yogurt",
    priceChf: 3.9,
    averageRating: 3.7,
    ratingCount: 203,
    availability: { kind: "restock", unit: "days", amount: 4 },
    brand: "AlpineCream",
  },
  {
    id: "yog-swissfold-plain-250",
    category: "plain-yogurt",
    priceChf: 2.1,
    averageRating: 4.25,
    ratingCount: 267,
    availability: { kind: "available" },
    brand: "SwissFold",
  },
  {
    id: "yog-swissfold-family-1kg",
    category: "plain-yogurt",
    priceChf: 4.8,
    averageRating: 2.8,
    ratingCount: 89,
    availability: { kind: "available" },
    brand: "SwissFold",
  },
  {
    id: "yog-swissfold-luxury-400",
    category: "plain-yogurt",
    priceChf: 5.5,
    averageRating: 3.9,
    ratingCount: 145,
    availability: { kind: "available" },
    brand: "SwissFold",
  },

  // —— Tomatoes: CampoVivo, RossoPrime, GardenLane, SunRipe ——
  {
    id: "tom-campovivo-round-500",
    category: "tomato",
    priceChf: 2.4,
    averageRating: 4.1,
    ratingCount: 372,
    availability: { kind: "available" },
    brand: "CampoVivo",
  },
  {
    id: "tom-campovivo-round-1kg",
    category: "tomato",
    priceChf: 4.5,
    averageRating: 4.2,
    ratingCount: 248,
    availability: { kind: "available" },
    brand: "CampoVivo",
  },
  {
    id: "tom-campovivo-cherry-400",
    category: "tomato",
    priceChf: 3.1,
    averageRating: 4.0,
    ratingCount: 223,
    availability: { kind: "available" },
    brand: "CampoVivo",
  },
  {
    id: "tom-rossoprime-vine-500",
    category: "tomato",
    priceChf: 4.2,
    averageRating: 4.5,
    ratingCount: 231,
    availability: { kind: "available" },
    brand: "RossoPrime",
  },
  {
    id: "tom-rossoprime-vine-750",
    category: "tomato",
    priceChf: 6.1,
    averageRating: 4.6,
    ratingCount: 146,
    availability: { kind: "restock", unit: "days", amount: 2 },
    brand: "RossoPrime",
  },
  {
    id: "tom-rossoprime-beef-500",
    category: "tomato",
    priceChf: 5.8,
    averageRating: 4.55,
    ratingCount: 112,
    availability: { kind: "available" },
    brand: "RossoPrime",
  },
  {
    id: "tom-gardenlane-salsa-1kg",
    category: "tomato",
    priceChf: 4.9,
    averageRating: 3.6,
    ratingCount: 145,
    availability: { kind: "available" },
    brand: "GardenLane",
  },
  {
    id: "tom-gardenlane-plum-800",
    category: "tomato",
    priceChf: 5.5,
    averageRating: 2.5,
    ratingCount: 67,
    availability: { kind: "available" },
    brand: "GardenLane",
  },
  {
    id: "tom-gardenlane-mini-250",
    category: "tomato",
    priceChf: 2.8,
    averageRating: 4.15,
    ratingCount: 334,
    availability: { kind: "available" },
    brand: "GardenLane",
  },
  {
    id: "tom-sunripe-kumato-500",
    category: "tomato",
    priceChf: 5.9,
    averageRating: 4.4,
    ratingCount: 156,
    availability: { kind: "available" },
    brand: "SunRipe",
  },
  {
    id: "tom-sunripe-roma-1kg",
    category: "tomato",
    priceChf: 7.2,
    averageRating: 2.9,
    ratingCount: 78,
    availability: { kind: "restock", unit: "days", amount: 5 },
    brand: "SunRipe",
  },
  {
    id: "tom-sunripe-vine-400",
    category: "tomato",
    priceChf: 4.2,
    averageRating: 3.8,
    ratingCount: 201,
    availability: { kind: "available" },
    brand: "SunRipe",
  },
];

const byId = new Map(products.map((p) => [p.id, p]));

export function featuredIndexOf(productId: string): number {
  return products.findIndex((p) => p.id === productId);
}

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

export function getSubcategoriesByMacroCategory(
  macroCategory: MacroCategory,
): Category[] {
  return [...subcategoriesByMacroCategory[macroCategory]];
}

export function getMacroCategoryBySubcategory(
  category: Category,
): MacroCategory | null {
  for (const macroCategory of MACRO_CATEGORIES) {
    if (subcategoriesByMacroCategory[macroCategory].includes(category)) {
      return macroCategory;
    }
  }
  return null;
}

export function getProductsByMacroCategory(macroCategory: MacroCategory): Product[] {
  const subcategories = new Set(subcategoriesByMacroCategory[macroCategory]);
  return products.filter((p) => subcategories.has(p.category));
}
