import Link from "next/link";
import { getProductById } from "@/data/catalog";
import { finalizeOrder } from "@/app/actions/shop";
import {
  cartAllReadyDate,
  computeShippingFees,
  estimatedDeliveryDate,
  formatDeliveryDateLong,
} from "@/lib/delivery";
import { formatChf } from "@/lib/format-money";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { translateProductName } from "@/lib/i18n/product-copy";
import { getServerT } from "@/lib/i18n/server";
import { lineTotal } from "@/lib/shop-types";
import type { PaymentMethod } from "@/lib/shop-types";
import { getPickupLabel } from "@/lib/pickup-stores";
import { readCartCookie, readCheckoutDraftCookie } from "@/lib/shop-cookies";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { Price } from "@/components/atoms/price";
import { SectionTitle } from "@/components/atoms/section-title";
import { CheckoutStepsNav } from "@/components/molecules/checkout-steps-nav";
import { redirect } from "next/navigation";
import type { TFunction } from "i18next";

function paymentLabelT(t: TFunction, p: PaymentMethod) {
  return t(`paymentMethod.${p}`, { ns: "shop" });
}

export default async function CheckoutSummaryPage() {
  const t = await getServerT();
  const intlLocale = await getIntlLocale();
  const cart = await readCartCookie();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const draft = await readCheckoutDraftCookie();
  if (!draft.deliverySaved) {
    redirect("/checkout/delivery");
  }
  if (!draft.paymentSaved) {
    redirect("/checkout/payment");
  }

  const resolved = cart.items
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (resolved.length === 0) {
    redirect("/cart");
  }

  const subtotal =
    Math.round(
      resolved.reduce(
        (sum, { item, product }) => sum + lineTotal(item, product),
        0,
      ) * 100,
    ) / 100;

  const fees = computeShippingFees(
    subtotal,
    draft.deliveryMode === "shipping" ? "shipping" : "pickup",
    draft.deliveryMode === "shipping" && draft.expressDelivery,
  );

  const grandTotal = Math.round((subtotal + fees.totalFeesChf) * 100) / 100;

  const pay = draft.payment;
  if (pay !== "card" && pay !== "bill" && pay !== "twint") {
    redirect("/checkout/payment");
  }

  let estimatedDeliveryLabel: string | null = null;
  if (draft.deliveryMode === "shipping") {
    const orderNow = new Date();
    const avail = resolved.map(({ product }) => ({
      availability: product.availability,
    }));
    const allReady = cartAllReadyDate(orderNow, avail);
    const eta = estimatedDeliveryDate(allReady, draft.expressDelivery);
    estimatedDeliveryLabel = formatDeliveryDateLong(eta, intlLocale);
  }

  return (
    <Container>
      <main id="main-content">
        <nav
          aria-label={t("checkout.breadcrumb", { ns: "shop" })}
          className="mb-2 text-sm text-muted-foreground"
        >
          <Link href="/cart" className="font-medium text-primary hover:underline">
            {t("checkout.cartLink", { ns: "shop" })}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">
            {t("summary.breadcrumbCurrent", { ns: "shop" })}
          </span>
        </nav>
        <CheckoutStepsNav current="summary" />
        <header className="mb-8 space-y-2">
          <SectionTitle as="h1">{t("summary.title", { ns: "shop" })}</SectionTitle>
          <p className="max-w text-muted-foreground">
            {t("summary.subtitle", { ns: "shop" })}
          </p>
        </header>

        <div className="space-y-8">
          <section
            aria-labelledby="items-heading"
            className="rounded-2xl border border-card-border bg-card p-6"
          >
            <h2 id="items-heading" className="text-lg font-semibold">
              {t("summary.itemsHeading", { ns: "shop" })}
            </h2>
            <ul className="mt-4 divide-y divide-card-border">
              {resolved.map(({ item, product }) => (
                <li
                  key={item.productId}
                  className="flex justify-between gap-4 py-3 text-sm first:pt-0"
                >
                  <span>
                    <span className="font-medium">
                      {translateProductName(t, product)}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      {t("summary.multiply", { ns: "shop" })} {item.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums font-medium text-primary">
                    {formatChf(lineTotal(item, product))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-card-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              {t("summary.deliveryHeading", { ns: "shop" })}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {draft.deliveryMode === "shipping" ? (
                <>
                  {t("summary.shipTo", { ns: "shop" })}{" "}
                  <strong className="text-foreground">
                    {draft.line1}, {draft.postalCode} {draft.city}
                  </strong>
                </>
              ) : (
                <>
                  {t("summary.pickupAt", { ns: "shop" })}{" "}
                  <strong className="text-foreground">
                    {draft.storeId
                      ? getPickupLabel(draft.storeId)
                      : "—"}
                  </strong>
                </>
              )}
            </p>
            {draft.deliveryMode === "shipping" ? (
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {draft.expressDelivery ? (
                  <li>
                    {t("summary.expressSelected", {
                      ns: "shop",
                      fee: formatChf(fees.expressFeeChf),
                    })}
                  </li>
                ) : (
                  <li>{t("summary.standardSelected", { ns: "shop" })}</li>
                )}
                {estimatedDeliveryLabel ? (
                  <li>
                    {t("summary.estimatedArrival", { ns: "shop" })}{" "}
                    <strong className="text-foreground">
                      {estimatedDeliveryLabel}
                    </strong>
                  </li>
                ) : null}
              </ul>
            ) : null}
            <p className="mt-3">
              <Link
                href="/checkout/delivery"
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                {t("summary.changeDelivery", { ns: "shop" })}
              </Link>
            </p>
          </section>

          <section className="rounded-2xl border border-card-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              {t("summary.paymentHeading", { ns: "shop" })}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="text-foreground">{paymentLabelT(t, pay)}</strong>
              {pay === "card" && draft.cardLast4.length === 4 ? (
                <>
                  {" "}
                  <span className="tabular-nums">
                    {t("summary.cardMasked", {
                      ns: "shop",
                      last4: draft.cardLast4,
                    })}
                  </span>
                </>
              ) : (
                <>
                  {" "}
                  {t("summary.paymentNote", { ns: "shop" })}
                </>
              )}
            </p>
            <p className="mt-3">
              <Link
                href="/checkout/payment"
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                {t("summary.changePayment", { ns: "shop" })}
              </Link>
            </p>
          </section>

          <section
            className="rounded-2xl border border-card-border bg-card p-6"
            aria-labelledby="totals-heading"
          >
            <h2 id="totals-heading" className="text-lg font-semibold">
              {t("summary.totalsHeading", { ns: "shop" })}
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {t("summary.goodsSubtotal", { ns: "shop" })}
                </dt>
                <dd className="tabular-nums font-medium">{formatChf(subtotal)}</dd>
              </div>
              {draft.deliveryMode === "shipping" ? (
                <>
                  {fees.smallOrderFeeChf > 0 ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        {t("summary.deliveryUnderThreshold", { ns: "shop" })}
                      </dt>
                      <dd className="tabular-nums font-medium">
                        {formatChf(fees.smallOrderFeeChf)}
                      </dd>
                    </div>
                  ) : null}
                  {fees.expressFeeChf > 0 ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        {t("summary.expressDelivery", { ns: "shop" })}
                      </dt>
                      <dd className="tabular-nums font-medium">
                        {formatChf(fees.expressFeeChf)}
                      </dd>
                    </div>
                  ) : null}
                  {fees.totalFeesChf === 0 ? (
                    <p className="text-muted-foreground">
                      {t("summary.noSurcharges", { ns: "shop" })}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">
                  {t("summary.pickupNoFees", { ns: "shop" })}
                </p>
              )}
              <div className="flex justify-between gap-4 border-t border-card-border pt-3 text-base font-semibold text-foreground">
                <dt>{t("summary.total", { ns: "shop" })}</dt>
                <dd className="tabular-nums">
                  <Price amount={grandTotal} />
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="flex flex-col gap-6 rounded-2xl border border-primary/30 bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="confirm-actions"
          >
            <div>
              <p id="confirm-actions" className="text-sm text-muted-foreground">
                {t("summary.readyDemo", { ns: "shop" })}
              </p>
              <p className="text-2xl font-bold">
                <Price amount={grandTotal} />
              </p>
            </div>
            <form action={finalizeOrder}>
              <Button type="submit" wide>
                {t("summary.confirmOrder", { ns: "shop" })}
              </Button>
            </form>
          </section>
        </div>
      </main>
    </Container>
  );
}
