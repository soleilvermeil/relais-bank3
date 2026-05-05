import Link from "next/link";
import { getProductById } from "@/data/catalog";
import { SMALL_ORDER_THRESHOLD_CHF, SMALL_ORDER_FEE_CHF } from "@/lib/delivery";
import { formatChf } from "@/lib/format-money";
import { getServerT } from "@/lib/i18n/server";
import { lineTotal } from "@/lib/shop-types";
import { readCartCookie } from "@/lib/shop-cookies";
import { Container } from "@/components/atoms/container";
import { Price } from "@/components/atoms/price";
import { SectionTitle } from "@/components/atoms/section-title";
import { CartLine } from "@/components/molecules/cart-line";

export default async function CartPage() {
  const t = await getServerT();
  const cart = await readCartCookie();
  const resolved = cart.items
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total =
    Math.round(
      resolved.reduce((sum, { item, product }) => sum + lineTotal(item, product), 0) *
        100,
    ) / 100;

  return (
    <Container>
      <main id="main-content">
        <SectionTitle as="h1" id="cart-heading">
          {t("cart.title", { ns: "shop" })}
        </SectionTitle>
        {resolved.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-card-border bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">{t("cart.empty", { ns: "shop" })}</p>
            <p className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-card-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-card-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("cart.continueShopping", { ns: "shop" })}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4" aria-labelledby="cart-heading">
              {resolved.map(({ item, product }) => (
                <CartLine key={item.productId} product={product} item={item} />
              ))}
            </ul>
            <section
              aria-label={t("cart.orderSummaryAria", { ns: "shop" })}
              className="mt-10 flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("cart.estimatedTotal", { ns: "shop" })}
                </p>
                <p className="text-2xl font-semibold">
                  <Price
                    amount={total}
                    aria-label={t("cart.totalAria", {
                      ns: "shop",
                      total: formatChf(total),
                    })}
                  />
                </p>
                {total < SMALL_ORDER_THRESHOLD_CHF ? (
                  <p className="mt-2 max-w-md text-xs text-muted-foreground">
                    {t("cart.smallOrderNote", {
                      ns: "shop",
                      threshold: formatChf(SMALL_ORDER_THRESHOLD_CHF),
                      fee: formatChf(SMALL_ORDER_FEE_CHF),
                    })}
                  </p>
                ) : null}
              </div>
              <Link
                href="/checkout/delivery"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("cart.goCheckout", { ns: "shop" })}
              </Link>
            </section>
          </>
        )}
      </main>
    </Container>
  );
}
