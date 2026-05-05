import Link from "next/link";
import { getProductById } from "@/data/catalog";
import {
  cartAllReadyDate,
  computeShippingFees,
  estimatedDeliveryDate,
  EXPRESS_FEE_CHF,
  formatDeliveryDateLong,
  pickupReadyAtStoreDate,
  SMALL_ORDER_FEE_CHF,
  SMALL_ORDER_THRESHOLD_CHF,
} from "@/lib/delivery";
import { getIntlLocale } from "@/lib/i18n/get-locale";
import { getServerT } from "@/lib/i18n/server";
import { lineTotal } from "@/lib/shop-types";
import { readCartCookie, readCheckoutDraftCookie } from "@/lib/shop-cookies";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { CheckoutStepsNav } from "@/components/molecules/checkout-steps-nav";
import { DeliveryStepForm } from "@/components/organisms/delivery-step-form";
import { redirect } from "next/navigation";

export default async function CheckoutDeliveryPage() {
  const t = await getServerT();
  const intlLocale = await getIntlLocale();
  const cart = await readCartCookie();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const initialDraft = await readCheckoutDraftCookie();

  const resolved = cart.items
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (resolved.length === 0) {
    redirect("/cart");
  }

  const subtotalChf =
    Math.round(
      resolved.reduce(
        (sum, { item, product }) => sum + lineTotal(item, product),
        0,
      ) * 100,
    ) / 100;

  const orderNow = new Date();
  const availabilities = resolved.map(({ product }) => ({
    availability: product.availability,
  }));
  const allReady = cartAllReadyDate(orderNow, availabilities);
  const etaStandard = estimatedDeliveryDate(allReady, false);
  const etaExpress = estimatedDeliveryDate(allReady, true);

  const feesIfStandard = computeShippingFees(subtotalChf, "shipping", false);
  const feesIfExpress = computeShippingFees(subtotalChf, "shipping", true);

  const shippingPreview = {
    smallOrderThresholdChf: SMALL_ORDER_THRESHOLD_CHF,
    smallOrderFeeChf: SMALL_ORDER_FEE_CHF,
    expressFeeChf: EXPRESS_FEE_CHF,
    smallOrderApplies: feesIfStandard.smallOrderFeeChf > 0,
    totalFeesStandardChf: feesIfStandard.totalFeesChf,
    totalFeesExpressChf: feesIfExpress.totalFeesChf,
    etaStandardLabel: formatDeliveryDateLong(etaStandard, intlLocale),
    etaExpressLabel: formatDeliveryDateLong(etaExpress, intlLocale),
    pickupReadyLabel: formatDeliveryDateLong(
      pickupReadyAtStoreDate(allReady),
      intlLocale,
    ),
  };

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
          <span className="text-foreground">{t("checkout.checkout", { ns: "shop" })}</span>
        </nav>
        <CheckoutStepsNav current="delivery" />
        <header className="mb-8 space-y-2">
          <SectionTitle as="h1">{t("delivery.title", { ns: "shop" })}</SectionTitle>
          <p className="max-w text-muted-foreground">
            {t("delivery.subtitle", { ns: "shop" })}
          </p>
        </header>
        <DeliveryStepForm
          initialDraft={initialDraft}
          shippingPreview={shippingPreview}
        />
      </main>
    </Container>
  );
}
