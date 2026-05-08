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
  const [beneficiaryIbanError, setBeneficiaryIbanError] = useState<string | null>(null);
  const [beneficiaryBicError, setBeneficiaryBicError] = useState<string | null>(null);
  const [debitAccountError, setDebitAccountError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  function validateIban(value: string): string | null {
    const normalized = value.replace(/\s/g, "").toUpperCase();
    if (normalized.length < 15 || normalized.length > 34) {
      return "IBAN must contain 15 to 34 characters.";
    }
    if (!/[A-Z]/.test(normalized)) {
      return "IBAN must contain letters.";
    }
    if (!/^[A-Z0-9]+$/.test(normalized)) {
      return "IBAN can only contain letters and numbers.";
    }
    return null;
  }

  function validateBic(value: string): string | null {
    const normalized = value.replace(/\s/g, "").toUpperCase();
    if (normalized === "") return null;
    if (normalized.length < 8 || normalized.length > 11) {
      return "BIC must contain 8 to 11 characters.";
    }
    if ((normalized.match(/[A-Z]/g) ?? []).length < 4) {
      return "BIC must contain letters.";
    }
    if (!/^[A-Z0-9]+$/.test(normalized)) {
      return "BIC can only contain letters and numbers.";
    }
    return null;
  }

  return (
    <form
      className="space-y-10"
      action={submitPayment}
      onSubmit={(event) => {
        const form = event.currentTarget;
        const data = new FormData(form);
        const ibanValue = String(data.get("beneficiaryIban") ?? "");
        const bicValue = String(data.get("beneficiaryBic") ?? "");
        const debitAccountValue = String(data.get("debitAccount") ?? "");
        const amountValue = String(data.get("amount") ?? "").trim();
        const ibanError = validateIban(ibanValue);
        const bicError = validateBic(bicValue);
        const nextDebitAccountError =
          debitAccountValue === "" ? "Please choose a debit account." : null;
        const nextAmountError = amountValue === "" ? "Amount is required." : null;
        setBeneficiaryIbanError(ibanError);
        setBeneficiaryBicError(bicError);
        setDebitAccountError(nextDebitAccountError);
        setAmountError(nextAmountError);
        if (ibanError || bicError || nextDebitAccountError || nextAmountError) {
          event.preventDefault();
          requestAnimationFrame(() => {
            const firstInvalid = form.querySelector<HTMLElement>("[aria-invalid='true']");
            if (!firstInvalid) return;
            firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
            firstInvalid.focus();
          });
        }
      }}
    >
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
              error={beneficiaryIbanError ?? undefined}
              defaultValue={initial?.beneficiaryIban ?? ""}
              onBlur={(event) => {
                setBeneficiaryIbanError(validateIban(event.currentTarget.value));
              }}
            />
            <TextField
              id="beneficiary-bic"
              name="beneficiaryBic"
              label={t("bankPayment.fields.beneficiaryBic")}
              width="full"
              hint="Example: POFICHBEXXX"
              error={beneficiaryBicError ?? undefined}
              defaultValue={initial?.beneficiaryBic ?? ""}
              onBlur={(event) => {
                setBeneficiaryBicError(validateBic(event.currentTarget.value));
              }}
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
              error={debitAccountError ?? undefined}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setDebitAccountError(next === "" ? "Please choose a debit account." : null);
              }}
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
              error={amountError ?? undefined}
              defaultValue={initial?.amount ?? ""}
              onChange={(event) => {
                const next = event.currentTarget.value.trim();
                setAmountError(next === "" ? "Amount is required." : null);
              }}
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
