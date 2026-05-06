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

export function PaymentBillFields({
  prefillFromShipping,
  deliveryLine1,
  deliveryPostalCode,
  deliveryCity,
}: Props) {
  const { t } = useTranslation("shop");
  return (
    <fieldset className="space-y-4 rounded-2xl border border-card-border bg-card p-4 sm:p-6">
      <legend className="px-1 text-base font-semibold text-foreground">
        {t("payment.bill.legend")}
      </legend>
      <p className="-mt-4 text-sm text-muted-foreground">
        {t("payment.bill.intro")}
      </p>
      <div className="space-y-1">
        <Label htmlFor="billOrgName">{t("payment.bill.orgName")}</Label>
        <Input
          id="billOrgName"
          name="billOrgName"
          autoComplete="organization"
          defaultValue=""
        />
        <FieldHint hint={`Example: ${t("payment.hints.org")}`} />
      </div>

      <PaymentBillingAddressFields
        prefillFromShipping={prefillFromShipping}
        deliveryLine1={deliveryLine1}
        deliveryPostalCode={deliveryPostalCode}
        deliveryCity={deliveryCity}
      />

      <div className="space-y-1">
        <Label htmlFor="billEmail">{t("payment.bill.email")}</Label>
        <Input
          id="billEmail"
          name="billEmail"
          type="email"
          autoComplete="email"
          defaultValue=""
        />
        <FieldHint hint={`Example: ${t("payment.hints.email")}`} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="billReference">{t("payment.bill.reference")}</Label>
        <Input id="billReference" name="billReference" defaultValue="" />
        <FieldHint hint={`Example: ${t("payment.hints.reference")}`} />
      </div>
    </fieldset>
  );
}
