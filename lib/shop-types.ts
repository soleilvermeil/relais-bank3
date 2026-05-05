import type { Product } from "@/data/catalog";
import { getPricingForProduct } from "@/lib/daily-discounts";

export type CartItem = { productId: string; quantity: number };

export type CartState = { items: CartItem[] };

export type PickupStoreId = "lausanne" | "geneve" | "morges";

export type DeliveryMode = "shipping" | "pickup";

export type PaymentMethod = "card" | "bill" | "twint";

export type CheckoutDraft = {
  deliveryMode: DeliveryMode;
  line1: string;
  postalCode: string;
  city: string;
  storeId: PickupStoreId | "";
  /** Shipping only: optional faster transit for an extra fee. */
  expressDelivery: boolean;
  payment: PaymentMethod | "";
  /** Last four digits of the card; set when payment is `card` (demo checkout only). */
  cardLast4: string;
  /** True after the delivery step is saved (screen 1). */
  deliverySaved?: boolean;
  /** True after the payment step is saved (screen 2). */
  paymentSaved?: boolean;
};

export type OrderDelivery =
  | {
      mode: "shipping";
      line1: string;
      postalCode: string;
      city: string;
    }
  | { mode: "pickup"; storeId: PickupStoreId; storeLabel: string };

export type OrderLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceChf: number;
  lineTotalChf: number;
};

export type OrderSnapshot = {
  placedAt: string;
  items: OrderLine[];
  delivery: OrderDelivery;
  payment: PaymentMethod;
  /** Goods subtotal before shipping surcharges (optional for older saved orders). */
  subtotalChf?: number;
  smallOrderFeeChf?: number;
  expressFeeChf?: number;
  /** YYYY-MM-DD local, shipping only. */
  estimatedDeliveryDateIso?: string | null;
  totalChf: number;
};

export function emptyCart(): CartState {
  return { items: [] };
}

export function emptyCheckoutDraft(): CheckoutDraft {
  return {
    deliveryMode: "shipping",
    line1: "",
    postalCode: "",
    city: "",
    storeId: "",
    expressDelivery: false,
    payment: "",
    cardLast4: "",
    deliverySaved: false,
    paymentSaved: false,
  };
}

export function lineTotal(item: CartItem, product: Product): number {
  const { discountedPriceChf } = getPricingForProduct(product);
  return Math.round(item.quantity * discountedPriceChf * 100) / 100;
}
