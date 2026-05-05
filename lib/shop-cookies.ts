import { cookies } from "next/headers";
import {
  emptyCart,
  emptyCheckoutDraft,
  type CartItem,
  type CartState,
  type CheckoutDraft,
  type OrderSnapshot,
  type PaymentMethod,
  type PickupStoreId,
} from "@/lib/shop-types";

export const SHOP_COOKIE_NAMES = {
  cart: "shop_cart",
  checkout: "shop_checkout",
  lastOrder: "shop_last_order",
} as const;

const WEEK_SEC = 60 * 60 * 24 * 7;

export function shopCookieBase() {
  return {
    httpOnly: true,
    path: "/" as const,
    maxAge: WEEK_SEC,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function parseCart(raw: string | undefined): CartState {
  if (!raw) return emptyCart();
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return emptyCart();
    const items = (data as { items?: unknown }).items;
    if (!Array.isArray(items)) return emptyCart();
    const out: CartItem[] = [];
    for (const row of items) {
      if (!row || typeof row !== "object") continue;
      const productId = (row as { productId?: unknown }).productId;
      const quantity = (row as { quantity?: unknown }).quantity;
      if (typeof productId !== "string" || productId.length === 0) continue;
      if (typeof quantity !== "number" || !Number.isInteger(quantity))
        continue;
      if (quantity < 1 || quantity > 99) continue;
      out.push({ productId, quantity });
    }
    return { items: out };
  } catch {
    return emptyCart();
  }
}

const PICKUP_IDS = new Set<PickupStoreId>(["lausanne", "geneve", "morges"]);
const PAYMENT_IDS = new Set<PaymentMethod>(["card", "bill", "twint"]);

function parseCheckoutDraft(raw: string | undefined): CheckoutDraft {
  if (!raw) return emptyCheckoutDraft();
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return emptyCheckoutDraft();
    const d = data as Record<string, unknown>;
    const deliveryMode = d.deliveryMode;
    const dm =
      deliveryMode === "pickup" || deliveryMode === "shipping"
        ? deliveryMode
        : "shipping";
    const line1 = typeof d.line1 === "string" ? d.line1.slice(0, 200) : "";
    const postalCode =
      typeof d.postalCode === "string" ? d.postalCode.slice(0, 16) : "";
    const city = typeof d.city === "string" ? d.city.slice(0, 120) : "";
    let storeId: PickupStoreId | "" = "";
    if (typeof d.storeId === "string" && PICKUP_IDS.has(d.storeId as PickupStoreId)) {
      storeId = d.storeId as PickupStoreId;
    }
    let payment: PaymentMethod | "" = "";
    if (typeof d.payment === "string" && PAYMENT_IDS.has(d.payment as PaymentMethod)) {
      payment = d.payment as PaymentMethod;
    }
    const deliverySaved =
      typeof d.deliverySaved === "boolean" ? d.deliverySaved : false;
    const paymentSaved =
      typeof d.paymentSaved === "boolean" ? d.paymentSaved : false;
    const expressDelivery =
      typeof d.expressDelivery === "boolean" ? d.expressDelivery : false;
    let cardLast4 = "";
    if (typeof d.cardLast4 === "string" && /^\d{4}$/.test(d.cardLast4)) {
      cardLast4 = d.cardLast4;
    }
    return {
      deliveryMode: dm,
      line1,
      postalCode,
      city,
      storeId,
      expressDelivery,
      payment,
      cardLast4,
      deliverySaved,
      paymentSaved,
    };
  } catch {
    return emptyCheckoutDraft();
  }
}

function parseLastOrder(raw: string | undefined): OrderSnapshot | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Partial<OrderSnapshot>;
    if (typeof o.placedAt !== "string" || !Array.isArray(o.items)) return null;
    if (typeof o.totalChf !== "number" || !Number.isFinite(o.totalChf))
      return null;
    if (!o.delivery || typeof o.delivery !== "object") return null;
    if (!o.payment || typeof o.payment !== "string") return null;
    if (!PAYMENT_IDS.has(o.payment as PaymentMethod)) return null;
    return o as OrderSnapshot;
  } catch {
    return null;
  }
}

export async function readCartCookie(): Promise<CartState> {
  const store = await cookies();
  return parseCart(store.get(SHOP_COOKIE_NAMES.cart)?.value);
}

export async function readCheckoutDraftCookie(): Promise<CheckoutDraft> {
  const store = await cookies();
  return parseCheckoutDraft(store.get(SHOP_COOKIE_NAMES.checkout)?.value);
}

export async function readLastOrderCookie(): Promise<OrderSnapshot | null> {
  const store = await cookies();
  return parseLastOrder(store.get(SHOP_COOKIE_NAMES.lastOrder)?.value);
}

export async function writeCartCookie(state: CartState): Promise<void> {
  const store = await cookies();
  store.set(SHOP_COOKIE_NAMES.cart, JSON.stringify(state), shopCookieBase());
}

export async function writeCheckoutDraftCookie(
  draft: CheckoutDraft,
): Promise<void> {
  const store = await cookies();
  store.set(
    SHOP_COOKIE_NAMES.checkout,
    JSON.stringify(draft),
    shopCookieBase(),
  );
}

export async function writeLastOrderCookie(order: OrderSnapshot): Promise<void> {
  const store = await cookies();
  store.set(
    SHOP_COOKIE_NAMES.lastOrder,
    JSON.stringify(order),
    shopCookieBase(),
  );
}

export async function clearCartCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SHOP_COOKIE_NAMES.cart);
}

export async function clearCheckoutDraftCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SHOP_COOKIE_NAMES.checkout);
}

export async function clearLastOrderCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SHOP_COOKIE_NAMES.lastOrder);
}
