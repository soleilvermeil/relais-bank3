import type { Availability } from "@/data/catalog";

export const SMALL_ORDER_THRESHOLD_CHF = 50;
export const SMALL_ORDER_FEE_CHF = 5;
export const EXPRESS_FEE_CHF = 8;

export const TRANSIT_DAYS_EXPRESS = 1;
export const TRANSIT_DAYS_STANDARD = 3;

function startOfCalendarDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addCalendarDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * First calendar date when inventory for this availability is ready,
 * relative to the order’s local calendar day.
 */
export function firstReadyDateForAvailability(
  orderDate: Date,
  availability: Availability,
): Date {
  const day0 = startOfCalendarDay(orderDate);
  switch (availability.kind) {
    case "available":
      return day0;
    case "unavailable_unknown":
      return addCalendarDays(day0, 30);
    case "restock": {
      const offset =
        availability.unit === "days"
          ? availability.amount
          : availability.amount * 7;
      return addCalendarDays(day0, offset);
    }
  }
}

/** Latest “all items ready” date for distinct cart lines (one availability per product). */
export function cartAllReadyDate(
  orderDate: Date,
  lines: { availability: Availability }[],
): Date {
  if (lines.length === 0) return startOfCalendarDay(orderDate);
  let max = firstReadyDateForAvailability(orderDate, lines[0].availability);
  for (let i = 1; i < lines.length; i++) {
    const d = firstReadyDateForAvailability(orderDate, lines[i].availability);
    if (d.getTime() > max.getTime()) max = d;
  }
  return max;
}

export function bumpWeekendToMonday(d: Date): Date {
  const x = startOfCalendarDay(d);
  const day = x.getDay();
  if (day === 0) return addCalendarDays(x, 1);
  if (day === 6) return addCalendarDays(x, 2);
  return x;
}

/**
 * Earliest pickup at the store: same calendar day as the latest line “ready” date
 * (`cartAllReadyDate`), unless that day is Saturday or Sunday — then the following Monday.
 */
export function pickupReadyAtStoreDate(allReadyDate: Date): Date {
  return bumpWeekendToMonday(allReadyDate);
}

/**
 * Calendar day the shipment is expected to arrive: all items ready, then 1 or 3
 * transit days, then weekend adjustment.
 */
export function estimatedDeliveryDate(
  allReadyDate: Date,
  express: boolean,
): Date {
  const transit = express ? TRANSIT_DAYS_EXPRESS : TRANSIT_DAYS_STANDARD;
  const d = addCalendarDays(startOfCalendarDay(allReadyDate), transit);
  return bumpWeekendToMonday(d);
}

export type ShippingFeeBreakdown = {
  smallOrderFeeChf: number;
  expressFeeChf: number;
  totalFeesChf: number;
};

export function computeShippingFees(
  subtotalGoodsChf: number,
  mode: "shipping" | "pickup",
  expressDelivery: boolean,
): ShippingFeeBreakdown {
  if (mode === "pickup") {
    return { smallOrderFeeChf: 0, expressFeeChf: 0, totalFeesChf: 0 };
  }
  const smallOrderFeeChf =
    subtotalGoodsChf < SMALL_ORDER_THRESHOLD_CHF ? SMALL_ORDER_FEE_CHF : 0;
  const expressFeeChf = expressDelivery ? EXPRESS_FEE_CHF : 0;
  return {
    smallOrderFeeChf,
    expressFeeChf,
    totalFeesChf: smallOrderFeeChf + expressFeeChf,
  };
}

/** Local calendar ISO date YYYY-MM-DD. */
export function formatLocalDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** BCP 47 locale (e.g. from `getIntlLocale()`). */
export function formatDeliveryDateLong(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
