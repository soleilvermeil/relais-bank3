"use client";

import { useActionState, useState } from "react";
import { useTranslation } from "react-i18next";
import { savePaymentStep, type CheckoutStepState } from "@/app/actions/shop";
import type { CheckoutDraft, PaymentMethod } from "@/lib/shop-types";
import { Button } from "@/components/atoms/button";
import { SectionTitle } from "@/components/atoms/section-title";
import { PaymentBillFields } from "@/components/molecules/payment-bill-fields";
import { PaymentCardFields } from "@/components/molecules/payment-card-fields";
import { PaymentTwintPanel } from "@/components/molecules/payment-twint-panel";

type Props = { initialDraft: CheckoutDraft };

export function PaymentStepForm({ initialDraft }: Props) {
  const { t } = useTranslation("shop");
  const [stepError, formAction, pending] = useActionState(
    savePaymentStep,
    null as CheckoutStepState,
  );
  const [draft, setDraft] = useState(initialDraft);

  function setPayment(payment: PaymentMethod) {
    setDraft((d) => ({ ...d, payment }));
  }

  const methods: { value: PaymentMethod; label: string }[] = [
    { value: "card", label: t("payment.methodCard") },
    { value: "bill", label: t("payment.methodBill") },
    { value: "twint", label: t("payment.methodTwint") },
  ];

  return (
    <form action={formAction} className="space-y-10">
      {stepError ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {stepError.message}
        </p>
      ) : null}

      <section aria-labelledby="pay-heading" className="space-y-4">
        <SectionTitle as="h2" id="pay-heading">
          {t("payment.heading")}
        </SectionTitle>
        <p className="text-sm text-muted-foreground">{t("payment.intro")}</p>
        <fieldset className="grid gap-3 sm:grid-cols-1">
          <legend className="sr-only">{t("payment.legend")}</legend>
          {methods.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-card-border bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring"
            >
              <input
                type="radio"
                name="payment"
                value={value}
                className="h-4 w-4 accent-primary"
                checked={draft.payment === value}
                onChange={() => setPayment(value)}
              />
              <span className="font-medium text-foreground">{label}</span>
            </label>
          ))}
        </fieldset>
      </section>

      {draft.payment === "card" ? (
        <PaymentCardFields
          prefillFromShipping={draft.deliveryMode === "shipping"}
          deliveryLine1={draft.line1}
          deliveryPostalCode={draft.postalCode}
          deliveryCity={draft.city}
        />
      ) : null}
      {draft.payment === "bill" ? (
        <PaymentBillFields
          prefillFromShipping={draft.deliveryMode === "shipping"}
          deliveryLine1={draft.line1}
          deliveryPostalCode={draft.postalCode}
          deliveryCity={draft.city}
        />
      ) : null}
      {draft.payment === "twint" ? <PaymentTwintPanel pending={pending} /> : null}

      {draft.payment !== "twint" ? (
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={pending || !draft.payment} wide>
            {pending
              ? t("payment.savePending")
              : !draft.payment
                ? t("payment.chooseFirst")
                : draft.payment === "card"
                  ? t("payment.continueCard")
                  : t("payment.continueBill")}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
