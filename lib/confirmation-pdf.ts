import type { TFunction } from "i18next";
import { jsPDF } from "jspdf";
import { formatChfPdf } from "@/lib/format-money";
import type { OrderSnapshot } from "@/lib/shop-types";

function intlLocale(locale: string): string {
  return locale.startsWith("fr") ? "fr-CH" : "en-CH";
}

function formatPlacedAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatEtaLine(iso: string, locale: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(intlLocale(locale), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function paymentLabel(t: TFunction, p: string): string {
  if (p === "card" || p === "bill" || p === "twint") {
    return t(`paymentMethod.${p}`, { ns: "shop" });
  }
  return p;
}

/** Builds a printable A4 PDF receipt for the demo order (uses current UI locale strings). */
export function buildOrderPdf(order: OrderSnapshot, t: TFunction, locale: string): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = doc.internal.pageSize.getWidth() - margin * 2;
  const lineGap = 5.5;
  let y = margin;

  function addLines(text: string, fontSize: number, style: "normal" | "bold" = "normal") {
    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxW);
    const lh = fontSize * 0.55;
    for (const line of lines) {
      if (y + lh > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lh;
    }
    y += lineGap * 0.35;
  }

  addLines(t("confirmation.title", { ns: "shop" }), 16, "bold");
  doc.setFont("helvetica", "normal");
  addLines(t("confirmation.subtitle", { ns: "shop" }), 10);
  addLines(
    `${t("confirmation.placedOn", { ns: "shop" })} ${formatPlacedAt(order.placedAt, locale)}`,
    10,
  );
  y += 3;

  addLines(t("confirmation.itemsHeading", { ns: "shop" }), 12, "bold");
  for (const line of order.items) {
    const row = `${line.name}  ${t("summary.multiply", { ns: "shop" })} ${line.quantity}  —  ${formatChfPdf(line.lineTotalChf)}`;
    addLines(row, 10);
  }

  y += 2;
  addLines(t("confirmation.fulfillmentHeading", { ns: "shop" }), 12, "bold");
  if (order.delivery.mode === "shipping") {
    addLines(
      `${t("confirmation.deliveryTo", { ns: "shop" })} ${order.delivery.line1}, ${order.delivery.postalCode} ${order.delivery.city}`,
      10,
    );
    if (order.estimatedDeliveryDateIso) {
      addLines(
        `${t("confirmation.estimatedArrival", { ns: "shop" })} ${formatEtaLine(order.estimatedDeliveryDateIso, locale)}`,
        10,
      );
    }
  } else {
    addLines(
      `${t("confirmation.pickupAt", { ns: "shop" })} ${order.delivery.storeLabel}`,
      10,
    );
  }
  addLines(
    `${t("confirmation.paymentLine", { ns: "shop" })} ${paymentLabel(t, order.payment)}`,
    10,
  );

  if (typeof order.subtotalChf === "number") {
    y += 2;
    addLines(t("confirmation.amountsHeading", { ns: "shop" }), 11, "bold");
    addLines(
      `${t("confirmation.goodsSubtotal", { ns: "shop" })} ${formatChfPdf(order.subtotalChf)}`,
      10,
    );
    if ((order.smallOrderFeeChf ?? 0) > 0) {
      addLines(
        `${t("confirmation.deliverySmall", { ns: "shop" })} ${formatChfPdf(order.smallOrderFeeChf!)}`,
        10,
      );
    }
    if ((order.expressFeeChf ?? 0) > 0) {
      addLines(
        `${t("confirmation.expressLine", { ns: "shop" })} ${formatChfPdf(order.expressFeeChf!)}`,
        10,
      );
    }
  }

  y += 4;
  addLines(
    `${t("confirmation.total", { ns: "shop" })} ${formatChfPdf(order.totalChf)}`,
    14,
    "bold",
  );

  return doc;
}
