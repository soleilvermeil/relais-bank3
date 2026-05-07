"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitPayment } from "@/app/actions/bank";
import { Button } from "@/components/atoms/button";
import { SectionTitle } from "@/components/atoms/section-title";
import { RadioGroupField } from "@/components/molecules/radio-group-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextField } from "@/components/molecules/text-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import type { PaymentDraft } from "@/lib/bank-types";

export type AccountOption = {
  id: number;
  label: string;
};

type Props = {
  debitAccounts: AccountOption[];
  initial?: Partial<PaymentDraft>;
};

export function BankPaymentForm({ debitAccounts, initial }: Props) {
  const { t } = useTranslation("common");
  const [paymentType, setPaymentType] = useState<"oneTime" | "standing">(
    initial?.paymentType === "standing" ? "standing" : "oneTime",
  );
  const [periodType, setPeriodType] = useState<"unlimited" | "endDate">(
    initial?.periodType === "endDate" ? "endDate" : "unlimited",
  );
  const [express, setExpress] = useState<"yes" | "no">(
    initial?.express === "yes" ? "yes" : "no",
  );

  return (
    <form className="space-y-10" action={submitPayment}>
      <section aria-labelledby="beneficiary-heading" className="space-y-4">
        <SectionTitle as="h2" id="beneficiary-heading">
          {t("bankPayment.sections.beneficiary")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="beneficiary-iban"
              name="beneficiaryIban"
              label={t("bankPayment.fields.beneficiaryIban")}
              required
              width="full"
              hint="Example: CH72 1111 2222 3333 4444 5"
              defaultValue={initial?.beneficiaryIban ?? ""}
            />
            <TextField
              id="beneficiary-bic"
              name="beneficiaryBic"
              label={t("bankPayment.fields.beneficiaryBic")}
              width="full"
              hint="Example: POFICHBEXXX"
              defaultValue={initial?.beneficiaryBic ?? ""}
            />
            <TextField
              id="beneficiary-name"
              name="beneficiaryName"
              label={t("bankPayment.fields.beneficiaryName")}
              required
              width="full"
              defaultValue={initial?.beneficiaryName ?? ""}
            />
            <SelectField
              id="beneficiary-country"
              name="beneficiaryCountry"
              label={t("bankPayment.fields.country")}
              required
              width="full"
              defaultValue={initial?.beneficiaryCountry ?? ""}
            >
                <option value="" disabled>
                  {t("bankPayment.placeholders.selectCountry")}
                </option>
                <option value="ch">Switzerland / Suisse</option>
                <option value="fr">France</option>
                <option value="de">Germany / Allemagne</option>
                <option value="it">Italy / Italie</option>
            </SelectField>
            <TextField
              id="beneficiary-postal"
              name="beneficiaryPostalCode"
              label={t("bankPayment.fields.postalCode")}
              required
              defaultValue={initial?.beneficiaryPostalCode ?? ""}
            />
            <TextField
              id="beneficiary-city"
              name="beneficiaryCity"
              label={t("bankPayment.fields.locality")}
              required
              defaultValue={initial?.beneficiaryCity ?? ""}
            />
            <TextField
              id="beneficiary-address1"
              name="beneficiaryAddress1"
              label={t("bankPayment.fields.street")}
              defaultValue={initial?.beneficiaryAddress1 ?? ""}
            />
            <TextField
              id="beneficiary-address2"
              name="beneficiaryAddress2"
              label={t("bankPayment.fields.houseNumber")}
              defaultValue={initial?.beneficiaryAddress2 ?? ""}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="payment-details-heading" className="space-y-4">
        <SectionTitle as="h2" id="payment-details-heading">
          {t("bankPayment.sections.paymentDetails")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <RadioGroupField
              name="paymentType"
              label={t("bankPayment.fields.paymentType")}
              value={paymentType}
              onChange={setPaymentType}
              required
              options={[
                { value: "oneTime", label: t("bankPayment.options.oneTime") },
                { value: "standing", label: t("bankPayment.options.standingOrder") },
              ]}
            />

            {paymentType === "standing" ? (
              <>
                <TextField
                  id="first-execution"
                  name="firstExecutionDate"
                  type="date"
                  label={t("bankPayment.fields.firstExecutionDate")}
                  required
                  defaultValue={initial?.firstExecutionDate ?? ""}
                />
                <SelectField
                  id="frequency"
                  name="frequency"
                  defaultValue={initial?.frequency ?? ""}
                  label={t("bankPayment.fields.frequency")}
                  required
                >
                    <option value="" disabled>
                      {t("bankPayment.placeholders.selectFrequency")}
                    </option>
                    <option value="weekly">{t("bankPayment.options.weekly")}</option>
                    <option value="monthly">{t("bankPayment.options.monthly")}</option>
                    <option value="quarterly">{t("bankPayment.options.quarterly")}</option>
                    <option value="yearly">{t("bankPayment.options.yearly")}</option>
                </SelectField>
                <SelectField
                  id="holiday-rule"
                  name="weekendHolidayRule"
                  defaultValue={initial?.weekendHolidayRule ?? "after"}
                  label={t("bankPayment.fields.weekendHolidayRule")}
                  required
                  width="full"
                >
                    <option value="before">{t("bankPayment.options.beforeHolidays")}</option>
                    <option value="after">{t("bankPayment.options.afterHolidays")}</option>
                </SelectField>
                <RadioGroupField
                  name="periodType"
                  label={t("bankPayment.fields.period")}
                  value={periodType}
                  onChange={setPeriodType}
                  required
                  options={[
                    { value: "unlimited", label: t("bankPayment.options.unlimited") },
                    { value: "endDate", label: t("bankPayment.options.endDate") },
                  ]}
                />
                {periodType === "endDate" ? (
                  <TextField
                    id="end-date"
                    name="endDate"
                    type="date"
                    label={t("bankPayment.fields.endDate")}
                    required
                    width="full"
                    defaultValue={initial?.endDate ?? ""}
                  />
                ) : null}
              </>
            ) : null}

            <SelectField
              id="debit-account"
              name="debitAccount"
              defaultValue={initial?.debitAccount ?? ""}
              label={t("bankPayment.fields.debitAccount")}
              required
            >
                <option value="" disabled>
                  {t("bankPayment.placeholders.selectDebitAccount")}
                </option>
                {debitAccounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.label}
                  </option>
                ))}
            </SelectField>
            <TextField
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              label={t("bankPayment.fields.amount")}
              required
              hint="Example: 250.00"
              defaultValue={initial?.amount ?? ""}
            />

            {paymentType === "oneTime" ? (
              <>
                <RadioGroupField
                  name="express"
                  label={t("bankPayment.fields.express")}
                  value={express}
                  onChange={setExpress}
                  required
                  hint={`Example: ${t("bankPayment.hints.expressFee")}`}
                  options={[
                    { value: "yes", label: t("bankPayment.options.expressYes") },
                    { value: "no", label: t("bankPayment.options.expressNo") },
                  ]}
                />

                {express === "no" ? (
                  <TextField
                    id="execution-date"
                    name="executionDate"
                    type="date"
                    label={t("bankPayment.fields.executionDate")}
                    required
                    width="full"
                    defaultValue={initial?.executionDate ?? ""}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="details-heading" className="space-y-4">
        <SectionTitle as="h2" id="details-heading">
          {t("bankPayment.sections.details")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4">
            <TextField
              id="rf-reference"
              name="rfReference"
              label={t("bankPayment.fields.rfReference")}
              width="full"
              hint="Example: RF..."
              defaultValue={initial?.rfReference ?? ""}
            />
            <TextareaField
              id="communication"
              name="communicationToBeneficiary"
              rows={3}
              label={t("bankPayment.fields.communicationToBeneficiary")}
              width="full"
              defaultValue={initial?.communicationToBeneficiary ?? ""}
            />
            <TextField
              id="accounting-text"
              name="accountingTextForYou"
              label={t("bankPayment.fields.accountingTextForYou")}
              width="full"
              defaultValue={initial?.accountingTextForYou ?? ""}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="optional-debtor-heading" className="space-y-4">
        <SectionTitle as="h2" id="optional-debtor-heading">
          {t("bankPayment.sections.debtorOptional")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="debtor-name"
              name="debtorName"
              label={t("bankPayment.fields.debtorName")}
              width="full"
              defaultValue={initial?.debtorName ?? ""}
            />
            <SelectField
              id="debtor-country"
              name="debtorCountry"
              defaultValue={initial?.debtorCountry ?? ""}
              label={t("bankPayment.fields.country")}
              width="full"
            >
                <option value="" disabled>
                  {t("bankPayment.placeholders.selectCountry")}
                </option>
                <option value="ch">Switzerland / Suisse</option>
                <option value="fr">France</option>
                <option value="de">Germany / Allemagne</option>
                <option value="it">Italy / Italie</option>
            </SelectField>
            <TextField
              id="debtor-postal"
              name="debtorPostalCode"
              label={t("bankPayment.fields.postalCode")}
              defaultValue={initial?.debtorPostalCode ?? ""}
            />
            <TextField
              id="debtor-city"
              name="debtorCity"
              label={t("bankPayment.fields.locality")}
              defaultValue={initial?.debtorCity ?? ""}
            />
            <TextField
              id="debtor-address1"
              name="debtorAddress1"
              label={t("bankPayment.fields.street")}
              defaultValue={initial?.debtorAddress1 ?? ""}
            />
            <TextField
              id="debtor-address2"
              name="debtorAddress2"
              label={t("bankPayment.fields.houseNumber")}
              defaultValue={initial?.debtorAddress2 ?? ""}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" wide>
          {t("bankPayment.actions.review")}
        </Button>
      </div>
    </form>
  );
}
