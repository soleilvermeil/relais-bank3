"use client";

import { useTranslation } from "react-i18next";
import { FieldHint } from "@/components/atoms/field-hint";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { PaymentBillingAddressFields } from "@/components/molecules/payment-billing-address-fields";

type Props = {
  prefillFromShipping: boolean;
  deliveryLine1: string;
  deliveryPostalCode: string;
  deliveryCity: string;
};

export function PaymentCardFields({
  prefillFromShipping,
  deliveryLine1,
  deliveryPostalCode,
  deliveryCity,
}: Props) {
  const { t } = useTranslation("shop");
  return (
    <fieldset className="space-y-4 rounded-2xl border border-card-border bg-card p-4 sm:p-6">
      <legend className="px-1 text-base font-semibold text-foreground">
        {t("payment.card.legend")}
      </legend>
      <p className="-mt-4 text-sm text-muted-foreground">
        {t("payment.card.intro")}
      </p>
      <div className="space-y-1">
        <Label htmlFor="cardNumber">{t("payment.card.number")}</Label>
        <Input
          id="cardNumber"
          name="cardNumber"
          inputMode="numeric"
          autoComplete="cc-number"
          defaultValue=""
          aria-describedby="hint-cardNumber"
        />
        <FieldHint
          id="hint-cardNumber"
          hint={`Example: ${t("payment.hints.cardNumber")}`}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="cardName">{t("payment.card.name")}</Label>
        <Input
          id="cardName"
          name="cardName"
          autoComplete="cc-name"
          defaultValue=""
        />
        <FieldHint hint={`Example: ${t("payment.hints.name")}`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cardExpiry">{t("payment.card.expiry")}</Label>
          <Input
            id="cardExpiry"
            name="cardExpiry"
            autoComplete="cc-exp"
            defaultValue=""
          />
          <FieldHint hint={`Example: ${t("payment.hints.expiry")}`} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cardCvc">{t("payment.card.cvc")}</Label>
          <Input
            id="cardCvc"
            name="cardCvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            defaultValue=""
          />
          <FieldHint hint={`Example: ${t("payment.hints.cvc")}`} />
        </div>
      </div>

      <PaymentBillingAddressFields
        prefillFromShipping={prefillFromShipping}
        deliveryLine1={deliveryLine1}
        deliveryPostalCode={deliveryPostalCode}
        deliveryCity={deliveryCity}
      />
    </fieldset>
  );
}
