"use client";

import { Trash2 } from "lucide-react";
import type { Product } from "@/data/catalog";
import { getPricingForProduct } from "@/lib/daily-discounts";
import { formatChf } from "@/lib/format-money";
import { translateProductName } from "@/lib/i18n/product-copy";
import type { CartItem } from "@/lib/shop-types";
import { lineTotal } from "@/lib/shop-types";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Price } from "@/components/atoms/price";
import {
  removeFromCartForm,
  setCartQuantityForm,
} from "@/app/actions/shop";

type Props = { product: Product; item: CartItem };

export function CartLine({ product, item }: Props) {
  const { t } = useTranslation(["shop", "catalog"]);
  const pricing = getPricingForProduct(product);
  const total = lineTotal(item, product);
  const lineId = `qty-${item.productId}`;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">
          {translateProductName(t, product)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:justify-end">
        <p className="text-sm tabular-nums text-muted-foreground sm:shrink-0">
          {t("cart.each", { price: formatChf(pricing.discountedPriceChf) })}
        </p>
        <form
          action={setCartQuantityForm}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="productId" value={item.productId} />
          <label
            htmlFor={lineId}
            className="shrink-0 text-sm font-medium text-foreground"
          >
            {t("cart.qty")}
          </label>
          <div className="w-24">
            <Input
              id={lineId}
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              defaultValue={item.quantity}
            />
          </div>
          <Button type="submit" variant="secondary" className="!min-h-10 !py-2">
            {t("cart.update")}
          </Button>
        </form>
        <form action={removeFromCartForm} className="flex items-center">
          <input type="hidden" name="productId" value={item.productId} />
          <button
            type="submit"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t("cart.remove")}
          >
            <Trash2 className="h-5 w-5" aria-hidden />
          </button>
        </form>
        <div className="min-w-[7rem] text-right sm:ml-1">
          <p className="text-xs text-muted-foreground">{t("cart.lineTotal")}</p>
          <Price amount={total} />
        </div>
      </div>
    </li>
  );
}
