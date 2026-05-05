"use client";

import { useActionState, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDeliveryStep, type CheckoutStepState } from "@/app/actions/shop";
import { PICKUP_STORES } from "@/lib/pickup-stores";
import { formatChf } from "@/lib/format-money";
import type { CheckoutDraft, DeliveryMode, PickupStoreId } from "@/lib/shop-types";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { SectionTitle } from "@/components/atoms/section-title";
import { Select } from "@/components/atoms/select";

export type DeliveryShippingPreview = {
  smallOrderThresholdChf: number;
  smallOrderFeeChf: number;
  expressFeeChf: number;
  smallOrderApplies: boolean;
  totalFeesStandardChf: number;
  totalFeesExpressChf: number;
  etaStandardLabel: string;
  etaExpressLabel: string;
  pickupReadyLabel: string;
};

type Props = {
  initialDraft: CheckoutDraft;
  shippingPreview: DeliveryShippingPreview;
};

export function DeliveryStepForm({ initialDraft, shippingPreview }: Props) {
  const { t } = useTranslation("shop");
  const [stepError, formAction, pending] = useActionState(
    saveDeliveryStep,
    null as CheckoutStepState,
  );
  const [draft, setDraft] = useState(initialDraft);

  function setDeliveryMode(mode: DeliveryMode) {
    setDraft((d) => ({
      ...d,
      deliveryMode: mode,
      expressDelivery: mode === "pickup" ? false : d.expressDelivery,
    }));
  }

  const sp = shippingPreview;

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

      <section aria-labelledby="how-heading" className="space-y-4">
        <SectionTitle as="h2" id="how-heading">
          {t("delivery.howHeading")}
        </SectionTitle>
        <fieldset className="space-y-3">
          <legend className="sr-only">{t("delivery.optionLegend")}</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-card-border bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring">
            <input
              type="radio"
              name="deliveryMode"
              value="shipping"
              className="mt-1 h-4 w-4 accent-primary"
              checked={draft.deliveryMode === "shipping"}
              onChange={() => setDeliveryMode("shipping")}
            />
            <span>
              <span className="font-semibold text-foreground">
                {t("delivery.shippingTitle")}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t("delivery.previewLi1", {
                  threshold: formatChf(sp.smallOrderThresholdChf),
                  fee: formatChf(sp.smallOrderFeeChf),
                  suffix: sp.smallOrderApplies
                    ? t("delivery.previewLi1_applies")
                    : t("delivery.previewLi1_not"),
                })}
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-card-border bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring">
            <input
              type="radio"
              name="deliveryMode"
              value="pickup"
              className="mt-1 h-4 w-4 accent-primary"
              checked={draft.deliveryMode === "pickup"}
              onChange={() => setDeliveryMode("pickup")}
            />
            <span>
              <span className="font-semibold text-foreground">
                {t("delivery.pickupTitle")}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t("delivery.pickupDesc")}
              </span>
            </span>
          </label>
        </fieldset>
      </section>

      {draft.deliveryMode === "shipping" ? (
        <fieldset className="space-y-4 rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <legend className="px-1 text-base font-semibold text-foreground">
            {t("delivery.cardLegendShipping")}
          </legend>
          <p id="addr-hint" className="-mt-4 text-sm text-muted-foreground">
            {t("delivery.addressHint")}
          </p>
          <h3
            id="addr-heading"
            className="text-base font-semibold text-foreground"
          >
            {t("delivery.addressHeading")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-1">
              <Label htmlFor="line1">{t("delivery.street")}</Label>
              <Input
                id="line1"
                name="line1"
                autoComplete="street-address"
                value={draft.line1}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, line1: e.target.value }))
                }
                aria-describedby="addr-hint"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="postalCode">{t("delivery.postalCode")}</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  autoComplete="postal-code"
                  value={draft.postalCode}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, postalCode: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">{t("delivery.city")}</Label>
                <Input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={draft.city}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, city: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3
              id="express-heading"
              className="text-base font-semibold text-foreground"
            >
              {t("delivery.expressTitle")}
            </h3>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="expressDelivery"
                className="mt-1 h-4 w-4 accent-primary"
                checked={draft.expressDelivery}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    expressDelivery: e.target.checked,
                  }))
                }
              />
              <span className="text-sm text-muted-foreground">
                {t("delivery.expressShort", {
                  fee: formatChf(sp.expressFeeChf),
                })}
              </span>
            </label>
          </div>
        </fieldset>
      ) : (
        <fieldset className="space-y-4 rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <legend className="px-1 text-base font-semibold text-foreground">
            {t("delivery.pickupHeading")}
          </legend>
          <div className="-mt-4 space-y-1">
            <Label htmlFor="storeId">{t("delivery.shopLocation")}</Label>
            <Select
              id="storeId"
              name="storeId"
              required={draft.deliveryMode === "pickup"}
              value={draft.storeId}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  storeId: e.target.value as PickupStoreId | "",
                }))
              }
            >
              <option value="">{t("delivery.selectShop")}</option>
              {PICKUP_STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </fieldset>
      )}

      <section
        aria-labelledby="delivery-bottom-summary-heading"
        className="rounded-2xl border border-card-border bg-muted/40 p-4 sm:p-6"
      >
        <h2
          id="delivery-bottom-summary-heading"
          className="text-base font-semibold text-foreground"
        >
          {t("delivery.bottomSummaryTitle")}
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">
              {t("delivery.bottomTotalDeliveryFees")}
            </dt>
            <dd className="font-medium text-foreground">
              {draft.deliveryMode === "shipping"
                ? formatChf(
                    draft.expressDelivery
                      ? sp.totalFeesExpressChf
                      : sp.totalFeesStandardChf,
                  )
                : formatChf(0)}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">
              {draft.deliveryMode === "shipping"
                ? t("summary.estimatedArrival")
                : t("delivery.bottomReadyForPickup")}
            </dt>
            <dd className="text-right font-medium text-foreground">
              {draft.deliveryMode === "shipping"
                ? draft.expressDelivery
                  ? sp.etaExpressLabel
                  : sp.etaStandardLabel
                : sp.pickupReadyLabel}
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} wide>
          {pending ? t("delivery.savePending") : t("delivery.continuePayment")}
        </Button>
      </div>
    </form>
  );
}
