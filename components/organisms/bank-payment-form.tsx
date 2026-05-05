"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { FieldHint } from "@/components/atoms/field-hint";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { SectionTitle } from "@/components/atoms/section-title";
import { Select } from "@/components/atoms/select";

function RequiredMark() {
  return <span className="ml-1 text-red-600">*</span>;
}

function OptionalMark() {
  return <span className="ml-1 text-muted-foreground">(optional)</span>;
}

export function BankPaymentForm() {
  const { t } = useTranslation("common");
  const [paymentType, setPaymentType] = useState<"oneTime" | "standing">("oneTime");
  const [periodType, setPeriodType] = useState<"unlimited" | "endDate">("unlimited");
  const [express, setExpress] = useState<"yes" | "no">("no");

  return (
    <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
      <section aria-labelledby="beneficiary-heading" className="space-y-4">
        <SectionTitle as="h2" id="beneficiary-heading">
          {t("bankPayment.sections.beneficiary")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="beneficiary-iban">
                {t("bankPayment.fields.beneficiaryIban")}
                <RequiredMark />
              </Label>
              <Input id="beneficiary-iban" name="beneficiaryIban" />
              <FieldHint example="CH72 1111 2222 3333 4444 5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="beneficiary-name">
                {t("bankPayment.fields.beneficiaryName")}
                <RequiredMark />
              </Label>
              <Input id="beneficiary-name" name="beneficiaryName" />
            </div>
            <div>
              <Label htmlFor="beneficiary-country">
                {t("bankPayment.fields.country")}
                <RequiredMark />
              </Label>
              <Select id="beneficiary-country" name="beneficiaryCountry" defaultValue="">
                <option value="" disabled>
                  {t("bankPayment.placeholders.selectCountry")}
                </option>
                <option value="ch">Switzerland / Suisse</option>
                <option value="fr">France</option>
                <option value="de">Germany / Allemagne</option>
                <option value="it">Italy / Italie</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="beneficiary-city">
                {t("bankPayment.fields.city")}
                <RequiredMark />
              </Label>
              <Input id="beneficiary-city" name="beneficiaryCity" required />
            </div>
            <div>
              <Label htmlFor="beneficiary-address1">
                {t("bankPayment.fields.addressLine1Optional")}
                <OptionalMark />
              </Label>
              <Input id="beneficiary-address1" name="beneficiaryAddress1" />
            </div>
            <div>
              <Label htmlFor="beneficiary-address2">
                {t("bankPayment.fields.addressLine2Optional")}
                <OptionalMark />
              </Label>
              <Input id="beneficiary-address2" name="beneficiaryAddress2" />
            </div>
            <div>
              <Label htmlFor="beneficiary-postal">
                {t("bankPayment.fields.postalCodeOptional")}
                <OptionalMark />
              </Label>
              <Input id="beneficiary-postal" name="beneficiaryPostalCode" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="payment-details-heading" className="space-y-4">
        <SectionTitle as="h2" id="payment-details-heading">
          {t("bankPayment.sections.paymentDetails")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              role="group"
              aria-labelledby="payment-type-label"
              className="sm:col-span-2 space-y-3"
            >
              <Label id="payment-type-label">
                {t("bankPayment.fields.paymentType")}
                <RequiredMark />
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                  <input
                    type="radio"
                    name="paymentType"
                    value="oneTime"
                    className="h-4 w-4 accent-primary"
                    checked={paymentType === "oneTime"}
                    onChange={() => setPaymentType("oneTime")}
                  />
                  <span>{t("bankPayment.options.oneTime")}</span>
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                  <input
                    type="radio"
                    name="paymentType"
                    value="standing"
                    className="h-4 w-4 accent-primary"
                    checked={paymentType === "standing"}
                    onChange={() => setPaymentType("standing")}
                  />
                  <span>{t("bankPayment.options.standingOrder")}</span>
                </label>
              </div>
            </div>

            {paymentType === "standing" ? (
              <>
                <div>
                  <Label htmlFor="first-execution">
                    {t("bankPayment.fields.firstExecutionDate")}
                    <RequiredMark />
                  </Label>
                  <Input id="first-execution" name="firstExecutionDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="frequency">
                    {t("bankPayment.fields.frequency")}
                    <RequiredMark />
                  </Label>
                  <Select id="frequency" name="frequency" defaultValue="">
                    <option value="" disabled>
                      {t("bankPayment.placeholders.selectFrequency")}
                    </option>
                    <option value="weekly">{t("bankPayment.options.weekly")}</option>
                    <option value="monthly">{t("bankPayment.options.monthly")}</option>
                    <option value="quarterly">{t("bankPayment.options.quarterly")}</option>
                    <option value="yearly">{t("bankPayment.options.yearly")}</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="holiday-rule">
                    {t("bankPayment.fields.weekendHolidayRule")}
                    <RequiredMark />
                  </Label>
                  <Select id="holiday-rule" name="weekendHolidayRule" defaultValue="after">
                    <option value="before">{t("bankPayment.options.beforeHolidays")}</option>
                    <option value="after">{t("bankPayment.options.afterHolidays")}</option>
                  </Select>
                </div>
                <div
                  role="group"
                  aria-labelledby="period-label"
                  className="sm:col-span-2 space-y-3"
                >
                  <Label id="period-label">
                    {t("bankPayment.fields.period")}
                    <RequiredMark />
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                      <input
                        type="radio"
                        name="periodType"
                        value="unlimited"
                        className="h-4 w-4 accent-primary"
                        checked={periodType === "unlimited"}
                        onChange={() => setPeriodType("unlimited")}
                      />
                      <span>{t("bankPayment.options.unlimited")}</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                      <input
                        type="radio"
                        name="periodType"
                        value="endDate"
                        className="h-4 w-4 accent-primary"
                        checked={periodType === "endDate"}
                        onChange={() => setPeriodType("endDate")}
                      />
                      <span>{t("bankPayment.options.endDate")}</span>
                    </label>
                  </div>
                </div>
                {periodType === "endDate" ? (
                  <div className="sm:col-span-2">
                    <Label htmlFor="end-date">
                      {t("bankPayment.fields.endDate")}
                      <RequiredMark />
                    </Label>
                    <Input id="end-date" name="endDate" type="date" />
                  </div>
                ) : null}
              </>
            ) : null}

            <div>
              <Label htmlFor="debit-account">
                {t("bankPayment.fields.debitAccount")}
                <RequiredMark />
              </Label>
              <Select id="debit-account" name="debitAccount" defaultValue="">
                <option value="" disabled>
                  {t("bankPayment.placeholders.selectDebitAccount")}
                </option>
                <option value="chf-main">CH10 ... 1111 (CHF)</option>
                <option value="eur-main">CH20 ... 2222 (EUR)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">
                {t("bankPayment.fields.amount")}
                <RequiredMark />
              </Label>
              <Input id="amount" name="amount" inputMode="decimal" />
              <FieldHint example="250.00" />
            </div>

            <div
              role="group"
              aria-labelledby="express-label"
              className="sm:col-span-2 space-y-3"
            >
              <Label id="express-label">
                {t("bankPayment.fields.express")}
                <RequiredMark />
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                  <input
                    type="radio"
                    name="express"
                    value="yes"
                    className="h-4 w-4 accent-primary"
                    checked={express === "yes"}
                    onChange={() => setExpress("yes")}
                  />
                  <span>{t("bankPayment.options.expressYes")}</span>
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                  <input
                    type="radio"
                    name="express"
                    value="no"
                    className="h-4 w-4 accent-primary"
                    checked={express === "no"}
                    onChange={() => setExpress("no")}
                  />
                  <span>{t("bankPayment.options.expressNo")}</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{t("bankPayment.hints.expressFee")}</p>
            </div>

            {express === "no" ? (
              <div className="sm:col-span-2">
                <Label htmlFor="execution-date">
                  {t("bankPayment.fields.executionDate")}
                  <RequiredMark />
                </Label>
                <Input id="execution-date" name="executionDate" type="date" />
              </div>
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
            <div>
              <Label htmlFor="rf-reference">
                {t("bankPayment.fields.rfReference")}
                <OptionalMark />
              </Label>
              <Input id="rf-reference" name="rfReference" />
              <FieldHint example="RF..." />
            </div>
            <div>
              <Label htmlFor="communication">
                {t("bankPayment.fields.communicationToBeneficiary")}
                <OptionalMark />
              </Label>
              <textarea
                id="communication"
                name="communicationToBeneficiary"
                rows={3}
                className="box-border w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-base text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <Label htmlFor="accounting-text">
                {t("bankPayment.fields.accountingTextForYou")}
                <OptionalMark />
              </Label>
              <Input id="accounting-text" name="accountingTextForYou" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="optional-debtor-heading" className="space-y-4">
        <SectionTitle as="h2" id="optional-debtor-heading">
          {t("bankPayment.sections.debtorOptional")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="debtor-name">
                {t("bankPayment.fields.debtorName")}
                <OptionalMark />
              </Label>
              <Input id="debtor-name" name="debtorName" />
            </div>
            <div>
              <Label htmlFor="debtor-country">
                {t("bankPayment.fields.country")}
                <OptionalMark />
              </Label>
              <Select id="debtor-country" name="debtorCountry" defaultValue="">
                <option value="" disabled>
                  {t("bankPayment.placeholders.selectCountry")}
                </option>
                <option value="ch">Switzerland / Suisse</option>
                <option value="fr">France</option>
                <option value="de">Germany / Allemagne</option>
                <option value="it">Italy / Italie</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="debtor-city">
                {t("bankPayment.fields.city")}
                <OptionalMark />
              </Label>
              <Input id="debtor-city" name="debtorCity" />
            </div>
            <div>
              <Label htmlFor="debtor-address1">
                {t("bankPayment.fields.addressLine1Optional")}
                <OptionalMark />
              </Label>
              <Input id="debtor-address1" name="debtorAddress1" />
            </div>
            <div>
              <Label htmlFor="debtor-address2">
                {t("bankPayment.fields.addressLine2Optional")}
                <OptionalMark />
              </Label>
              <Input id="debtor-address2" name="debtorAddress2" />
            </div>
            <div>
              <Label htmlFor="debtor-postal">
                {t("bankPayment.fields.postalCodeOptional")}
                <OptionalMark />
              </Label>
              <Input id="debtor-postal" name="debtorPostalCode" />
            </div>
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
