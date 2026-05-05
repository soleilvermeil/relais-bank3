"use client";

import { FileDown, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buildOrderPdf } from "@/lib/confirmation-pdf";
import type { OrderSnapshot } from "@/lib/shop-types";
import { Button } from "@/components/atoms/button";

type Props = { order: OrderSnapshot };

/** Localized prefix, e.g. `receipt_20260418_1811.pdf` / `recu_20260418_1811.pdf` */
function buildReceiptPdfFilename(
  t: (key: string, options?: { ns: string }) => string,
): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const prefix = t("receiptFilenamePrefix", { ns: "shop" });
  return `${prefix}_${y}${m}${day}_${h}${min}.pdf`;
}

export function ConfirmationActions({ order }: Props) {
  const { t, i18n } = useTranslation("shop");

  function handlePrint() {
    window.print();
  }

  function handleSave() {
    const doc = buildOrderPdf(order, t, i18n.language);
    doc.save(buildReceiptPdfFilename(t));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        className="!min-h-10 !py-2"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 shrink-0" aria-hidden />
        {t("confirmation.print")}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="!min-h-10 !py-2"
        onClick={handleSave}
      >
        <FileDown className="h-4 w-4 shrink-0" aria-hidden />
        {t("confirmation.save")}
      </Button>
    </div>
  );
}
