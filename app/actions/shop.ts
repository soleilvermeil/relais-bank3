"use server";

import type { TFunction } from "i18next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Availability } from "@/data/catalog";
import { getProductById } from "@/data/catalog";
import { getPricingForProduct } from "@/lib/daily-discounts";
import { getActionT } from "@/lib/i18n/action-t";
import { translateProductName } from "@/lib/i18n/product-copy";
import {
  cartAllReadyDate,
  computeShippingFees,
  estimatedDeliveryDate,
  formatLocalDateIso,
} from "@/lib/delivery";
import { getPickupLabel } from "@/lib/pickup-stores";
import {
  clearCartCookie,
  clearCheckoutDraftCookie,
  clearLastOrderCookie,
  readCartCookie,
  readCheckoutDraftCookie,
  writeCartCookie,
  writeCheckoutDraftCookie,
  writeLastOrderCookie,
} from "@/lib/shop-cookies";
import {
  lineTotal,
  type CheckoutDraft,
  type OrderSnapshot,
  type PaymentMethod,
} from "@/lib/shop-types";

export type CheckoutStepState = { ok: false; message: string } | null;

function cardLast4FromForm(formData: FormData): string {
  const raw = String(formData.get("cardNumber") ?? "").replace(/\D/g, "");
  if (raw.length < 13) return "";
  return raw.slice(-4);
}

function validateCardFields(formData: FormData, te: TFunction): string | null {
  const raw = String(formData.get("cardNumber") ?? "").replace(/\D/g, "");
  if (raw.length < 13 || raw.length > 19) {
    return te("errors.cardNumber", { ns: "shop" });
  }
  const name = String(formData.get("cardName") ?? "").trim();
  if (name.length < 2) {
    return te("errors.cardName", { ns: "shop" });
  }
  const expNorm = String(formData.get("cardExpiry") ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!/^\d{2}\/\d{2}$/.test(expNorm)) {
    return te("errors.cardExpiry", { ns: "shop" });
  }
  const cvc = String(formData.get("cardCvc") ?? "").replace(/\D/g, "");
  if (cvc.length < 3 || cvc.length > 4) {
    return te("errors.cardCvc", { ns: "shop" });
  }
  return null;
}

function validateBillingAddress(formData: FormData, te: TFunction): string | null {
  const line1 = String(formData.get("billingLine1") ?? "").trim();
  const postalCode = String(formData.get("billingPostalCode") ?? "").trim();
  const city = String(formData.get("billingCity") ?? "").trim();
  if (line1.length < 3) {
    return te("errors.billingStreet", { ns: "shop" });
  }
  if (postalCode.length < 3) {
    return te("errors.billingPostal", { ns: "shop" });
  }
  if (city.length < 2) {
    return te("errors.billingCity", { ns: "shop" });
  }
  return null;
}

function validateBillFields(formData: FormData, te: TFunction): string | null {
  const org = String(formData.get("billOrgName") ?? "").trim();
  if (org.length < 2) {
    return te("errors.billOrg", { ns: "shop" });
  }
  const email = String(formData.get("billEmail") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return te("errors.billEmail", { ns: "shop" });
  }
  return null;
}

function revalidateShopPaths() {
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/checkout/delivery");
  revalidatePath("/checkout/payment");
  revalidatePath("/checkout/summary");
  revalidatePath("/confirmation");
}

export async function addToCartForm(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const qtyRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(qtyRaw) && qtyRaw >= 1 ? Math.min(99, Math.floor(qtyRaw)) : 1;
  if (!getProductById(productId)) return;

  const cart = await readCartCookie();
  const idx = cart.items.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    cart.items[idx] = {
      productId,
      quantity: Math.min(99, cart.items[idx].quantity + quantity),
    };
  } else {
    cart.items.push({ productId, quantity });
  }
  await writeCartCookie(cart);
  revalidateShopPaths();
  revalidatePath("/", "layout");
  revalidatePath(`/products/${productId}`);

}

export async function setCartQuantityForm(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const qtyRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : 0;
  const cart = await readCartCookie();

  if (!getProductById(productId)) {
    await writeCartCookie(cart);
    revalidateShopPaths();
    return;
  }

  if (quantity < 1) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    const q = Math.min(99, quantity);
    const idx = cart.items.findIndex((i) => i.productId === productId);
    if (idx >= 0) cart.items[idx] = { productId, quantity: q };
    else cart.items.push({ productId, quantity: q });
  }

  await writeCartCookie(cart);
  revalidateShopPaths();
}

export async function removeFromCartForm(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const cart = await readCartCookie();
  cart.items = cart.items.filter((i) => i.productId !== productId);
  await writeCartCookie(cart);
  revalidateShopPaths();
}

export async function saveDeliveryStep(
  _prev: CheckoutStepState,
  formData: FormData,
): Promise<CheckoutStepState> {
  const te = await getActionT();
  const deliveryMode = formData.get("deliveryMode");
  const dm =
    deliveryMode === "pickup" || deliveryMode === "shipping"
      ? deliveryMode
      : null;
  const line1 = String(formData.get("line1") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const storeId = String(formData.get("storeId") ?? "").trim();

  if (!dm) {
    return { ok: false, message: te("errors.chooseDeliveryMode", { ns: "shop" }) };
  }

  if (dm === "shipping") {
    if (line1.length < 3) {
      return { ok: false, message: te("errors.street", { ns: "shop" }) };
    }
    if (postalCode.length < 3) {
      return { ok: false, message: te("errors.postal", { ns: "shop" }) };
    }
    if (city.length < 2) {
      return { ok: false, message: te("errors.city", { ns: "shop" }) };
    }
  } else {
    if (storeId !== "lausanne" && storeId !== "geneve" && storeId !== "morges") {
      return { ok: false, message: te("errors.pickupShop", { ns: "shop" }) };
    }
  }

  const expressRaw = formData.get("expressDelivery");
  const expressDelivery =
    dm === "shipping" &&
    (expressRaw === "on" ||
      expressRaw === "true" ||
      String(expressRaw) === "1");

  const prev = await readCheckoutDraftCookie();
  const next: CheckoutDraft = {
    ...prev,
    deliveryMode: dm,
    expressDelivery: dm === "shipping" ? expressDelivery : false,
    deliverySaved: true,
    paymentSaved: false,
    payment: "",
    cardLast4: "",
  };

  if (dm === "shipping") {
    next.line1 = line1;
    next.postalCode = postalCode;
    next.city = city;
    next.storeId = "";
  } else {
    next.line1 = "";
    next.postalCode = "";
    next.city = "";
    next.storeId = storeId as CheckoutDraft["storeId"];
  }

  await writeCheckoutDraftCookie(next);
  revalidateShopPaths();
  redirect("/checkout/payment");
}

export async function savePaymentStep(
  _prev: CheckoutStepState,
  formData: FormData,
): Promise<CheckoutStepState> {
  const te = await getActionT();
  const draft = await readCheckoutDraftCookie();
  if (!draft.deliverySaved) {
    redirect("/checkout/delivery");
  }

  const payment = formData.get("payment");
  const pay =
    payment === "card" || payment === "bill" || payment === "twint"
      ? (payment as PaymentMethod)
      : null;

  if (!pay) {
    return { ok: false, message: te("errors.choosePayment", { ns: "shop" }) };
  }

  if (pay === "card") {
    const cardErr = validateCardFields(formData, te);
    if (cardErr) return { ok: false, message: cardErr };
    const addrErr = validateBillingAddress(formData, te);
    if (addrErr) return { ok: false, message: addrErr };
  } else if (pay === "bill") {
    const billErr = validateBillFields(formData, te);
    if (billErr) return { ok: false, message: billErr };
    const addrErr = validateBillingAddress(formData, te);
    if (addrErr) return { ok: false, message: addrErr };
  }

  const cardLast4 = pay === "card" ? cardLast4FromForm(formData) : "";

  const next: CheckoutDraft = {
    ...draft,
    payment: pay,
    paymentSaved: true,
    cardLast4,
  };
  await writeCheckoutDraftCookie(next);
  revalidateShopPaths();
  redirect("/checkout/summary");
}

export async function finalizeOrder() {
  const draft = await readCheckoutDraftCookie();
  if (!draft.deliverySaved || !draft.paymentSaved) {
    redirect("/checkout/delivery");
  }

  const pay = draft.payment;
  if (pay !== "card" && pay !== "bill" && pay !== "twint") {
    redirect("/checkout/payment");
  }

  const dm = draft.deliveryMode;
  if (dm === "shipping") {
    if (
      draft.line1.length < 3 ||
      draft.postalCode.length < 3 ||
      draft.city.length < 2
    ) {
      redirect("/checkout/delivery");
    }
  } else {
    if (
      draft.storeId !== "lausanne" &&
      draft.storeId !== "geneve" &&
      draft.storeId !== "morges"
    ) {
      redirect("/checkout/delivery");
    }
  }

  const cart = await readCartCookie();
  const t = await getActionT();
  const lines: OrderSnapshot["items"] = [];
  const availabilityForEta: { availability: Availability }[] = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const p = getProductById(item.productId);
    if (!p) continue;
    const pricing = getPricingForProduct(p);
    const lt = lineTotal(item, p);
    subtotal += lt;
    availabilityForEta.push({ availability: p.availability });
    lines.push({
      productId: item.productId,
      name: translateProductName(t, p),
      quantity: item.quantity,
      unitPriceChf: pricing.discountedPriceChf,
      lineTotalChf: lt,
    });
  }

  if (lines.length === 0) {
    redirect("/cart");
  }

  subtotal = Math.round(subtotal * 100) / 100;

  const fees = computeShippingFees(
    subtotal,
    dm === "shipping" ? "shipping" : "pickup",
    dm === "shipping" && draft.expressDelivery,
  );
  const total = Math.round((subtotal + fees.totalFeesChf) * 100) / 100;

  const orderDate = new Date();
  let estimatedDeliveryDateIso: string | null = null;
  if (dm === "shipping" && availabilityForEta.length > 0) {
    const allReady = cartAllReadyDate(orderDate, availabilityForEta);
    const eta = estimatedDeliveryDate(allReady, draft.expressDelivery);
    estimatedDeliveryDateIso = formatLocalDateIso(eta);
  }

  const delivery =
    dm === "shipping"
      ? {
          mode: "shipping" as const,
          line1: draft.line1,
          postalCode: draft.postalCode,
          city: draft.city,
        }
      : {
          mode: "pickup" as const,
          storeId: draft.storeId as "lausanne" | "geneve" | "morges",
          storeLabel: getPickupLabel(draft.storeId as "lausanne" | "geneve" | "morges"),
        };

  const order: OrderSnapshot = {
    placedAt: new Date().toISOString(),
    items: lines,
    delivery,
    payment: pay,
    subtotalChf: subtotal,
    smallOrderFeeChf: fees.smallOrderFeeChf,
    expressFeeChf: fees.expressFeeChf,
    estimatedDeliveryDateIso,
    totalChf: total,
  };

  await writeLastOrderCookie(order);
  await clearCartCookie();
  await clearCheckoutDraftCookie();
  revalidateShopPaths();
  redirect("/confirmation");
}

/** Clears the confirmation cookie and returns to the shop. */
export async function dismissConfirmation() {
  await clearLastOrderCookie();
  revalidatePath("/confirmation");
  redirect("/");
}
