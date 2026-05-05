import { redirect } from "next/navigation";
import { formatDeliveryDateLong } from "@/lib/delivery";
import { formatChf } from "@/lib/format-money";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { getServerT } from "@/lib/i18n/server";
import { readLastOrderCookie } from "@/lib/shop-cookies";
import { dismissConfirmation } from "@/app/actions/shop";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { ConfirmationActions } from "@/components/molecules/confirmation-actions";
import { SectionTitle } from "@/components/atoms/section-title";
import { Price } from "@/components/atoms/price";
import type { TFunction } from "i18next";

function paymentLabelT(t: TFunction, p: string) {
  if (p === "card" || p === "bill" || p === "twint") {
    return t(`paymentMethod.${p}`, { ns: "shop" });
  }
  return p;
}

export default async function ConfirmationPage() {
  const t = await getServerT();
  const intlLocale = await getIntlLocale();
  const order = await readLastOrderCookie();
  if (!order) {
    redirect("/");
  }

  const date = new Date(order.placedAt);
  const estimatedDeliveryLabel =
    order.estimatedDeliveryDateIso &&
    order.delivery.mode === "shipping"
      ? formatDeliveryDateLong(
          new Date(`${order.estimatedDeliveryDateIso}T12:00:00`),
          intlLocale,
        )
      : null;

  return (
    <Container>
      <main id="main-content">
        <div className="mx-auto max-w-2xl rounded-3xl border border-card-border bg-card p-6 shadow-sm sm:p-10">
          <p className="text-4xl" aria-hidden="true">
            ✓
          </p>
          <SectionTitle as="h1" id="confirm-heading" className="mt-2">
            {t("confirmation.title", { ns: "shop" })}
          </SectionTitle>
          <p className="mt-2 text-muted-foreground">
            {t("confirmation.subtitle", { ns: "shop" })}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("confirmation.placedOn", { ns: "shop" })}{" "}
            <time dateTime={order.placedAt}>
              {date.toLocaleString(intlLocale, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </p>

          <section className="mt-8 space-y-3" aria-labelledby="confirm-heading">
            <h2 className="text-lg font-semibold">
              {t("confirmation.itemsHeading", { ns: "shop" })}
            </h2>
            <ul className="divide-y divide-card-border rounded-2xl border border-card-border">
              {order.items.map((line) => (
                <li
                  key={`${line.productId}-${line.quantity}`}
                  className="flex justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-medium text-foreground">{line.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {t("summary.multiply", { ns: "shop" })} {line.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums font-medium text-primary">
                    {formatChf(line.lineTotalChf)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 space-y-2 text-sm">
            <h2 className="text-lg font-semibold">
              {t("confirmation.fulfillmentHeading", { ns: "shop" })}
            </h2>
            {order.delivery.mode === "shipping" ? (
              <>
                <p>
                  {t("confirmation.deliveryTo", { ns: "shop" })}{" "}
                  <strong>
                    {order.delivery.line1}, {order.delivery.postalCode}{" "}
                    {order.delivery.city}
                  </strong>
                </p>
                {estimatedDeliveryLabel ? (
                  <p>
                    {t("confirmation.estimatedArrival", { ns: "shop" })}{" "}
                    <strong>{estimatedDeliveryLabel}</strong>
                  </p>
                ) : null}
              </>
            ) : (
              <p>
                {t("confirmation.pickupAt", { ns: "shop" })}{" "}
                <strong>{order.delivery.storeLabel}</strong>
              </p>
            )}
            <p>
              {t("confirmation.paymentLine", { ns: "shop" })}{" "}
              <strong>{paymentLabelT(t, order.payment)}</strong>
            </p>
          </section>

          {typeof order.subtotalChf === "number" ? (
            <section className="mt-4 space-y-2 text-sm text-muted-foreground">
              <h2 className="text-base font-semibold text-foreground">
                {t("confirmation.amountsHeading", { ns: "shop" })}
              </h2>
              <p>
                {t("confirmation.goodsSubtotal", { ns: "shop" })}{" "}
                {formatChf(order.subtotalChf)}
              </p>
              {(order.smallOrderFeeChf ?? 0) > 0 ? (
                <p>
                  {t("confirmation.deliverySmall", { ns: "shop" })}{" "}
                  {formatChf(order.smallOrderFeeChf!)}
                </p>
              ) : null}
              {(order.expressFeeChf ?? 0) > 0 ? (
                <p>
                  {t("confirmation.expressLine", { ns: "shop" })}{" "}
                  {formatChf(order.expressFeeChf!)}
                </p>
              ) : null}
            </section>
          ) : null}

          <div className="mt-8 space-y-6 border-t border-card-border pt-8">
            <p className="text-lg">
              {t("confirmation.total", { ns: "shop" })}{" "}
              <Price amount={order.totalChf} />
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="print:hidden">
                <ConfirmationActions order={order} />
              </div>
              <form action={dismissConfirmation} className="print:hidden">
                <Button type="submit" variant="secondary">
                  {t("confirmation.startAnother", { ns: "shop" })}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}
