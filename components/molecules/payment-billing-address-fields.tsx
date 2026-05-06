"use client";

import { useTranslation } from "react-i18next";
import { FieldHint } from "@/components/atoms/field-hint";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

type Props = {
  /** When true, default values match the home-delivery address from step 1. */
  prefillFromShipping: boolean;
  deliveryLine1: string;
  deliveryPostalCode: string;
  deliveryCity: string;
};

export function PaymentBillingAddressFields({
  prefillFromShipping,
  deliveryLine1,
  deliveryPostalCode,
  deliveryCity,
}: Props) {
  const { t } = useTranslation("shop");
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="billingLine1">{t("payment.billing.street")}</Label>
        <Input
          id="billingLine1"
          name="billingLine1"
          autoComplete="billing street-address"
          defaultValue={prefillFromShipping ? deliveryLine1 : ""}
        />
        <FieldHint hint={`Example: ${t("payment.hints.street")}`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="billingPostalCode">{t("payment.billing.postalCode")}</Label>
          <Input
            id="billingPostalCode"
            name="billingPostalCode"
            autoComplete="billing postal-code"
            defaultValue={prefillFromShipping ? deliveryPostalCode : ""}
          />
          <FieldHint hint={`Example: ${t("payment.hints.postal")}`} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="billingCity">{t("payment.billing.city")}</Label>
          <Input
            id="billingCity"
            name="billingCity"
            autoComplete="billing address-level2"
            defaultValue={prefillFromShipping ? deliveryCity : ""}
          />
          <FieldHint hint={`Example: ${t("payment.hints.city")}`} />
        </div>
      </div>
    </div>
  );
}
