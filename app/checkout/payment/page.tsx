import Link from "next/link";
import { readCartCookie, readCheckoutDraftCookie } from "@/lib/shop-cookies";
import { getServerT } from "@/lib/i18n/server";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { CheckoutStepsNav } from "@/components/molecules/checkout-steps-nav";
import { PaymentStepForm } from "@/components/organisms/payment-step-form";
import { redirect } from "next/navigation";

export default async function CheckoutPaymentPage() {
  const t = await getServerT();
  const cart = await readCartCookie();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const initialDraft = await readCheckoutDraftCookie();
  if (!initialDraft.deliverySaved) {
    redirect("/checkout/delivery");
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
          <Link
            href="/checkout/delivery"
            className="font-medium text-primary hover:underline"
          >
            {t("checkout.stepDelivery", { ns: "shop" })}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("payment.title", { ns: "shop" })}</span>
        </nav>
        <CheckoutStepsNav current="payment" />
        <header className="mb-8 space-y-2">
          <SectionTitle as="h1">{t("payment.title", { ns: "shop" })}</SectionTitle>
          <p className="max-w text-muted-foreground">
            {t("payment.subtitle", { ns: "shop" })}
          </p>
        </header>
        <PaymentStepForm initialDraft={initialDraft} />
      </main>
    </Container>
  );
}
