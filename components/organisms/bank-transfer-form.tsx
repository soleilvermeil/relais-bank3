"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { SectionTitle } from "@/components/atoms/section-title";
import { RadioGroupField } from "@/components/molecules/radio-group-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextField } from "@/components/molecules/text-field";

export function BankTransferForm() {
  const { t } = useTranslation("common");
  const [executionMode, setExecutionMode] = useState<"immediate" | "date">("immediate");

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <section aria-labelledby="transfer-details-heading" className="space-y-4">
        <SectionTitle as="h2" id="transfer-details-heading">
          {t("bankTransfer.sections.transferDetails")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="transfer-debit"
              name="debitAccount"
              defaultValue=""
              label={t("bankTransfer.fields.debitAccount")}
              required
            >
                <option value="" disabled>
                  {t("bankTransfer.placeholders.selectDebitAccount")}
                </option>
                <option value="chf-main">CH10 ... 1111 (CHF)</option>
                <option value="savings">CH30 ... 3333 (Savings / Epargne)</option>
            </SelectField>
            <SelectField
              id="transfer-credit"
              name="creditAccount"
              defaultValue=""
              label={t("bankTransfer.fields.creditAccount")}
              required
            >
                <option value="" disabled>
                  {t("bankTransfer.placeholders.selectCreditAccount")}
                </option>
                <option value="chf-main">CH10 ... 1111 (CHF)</option>
                <option value="savings">CH30 ... 3333 (Savings / Epargne)</option>
            </SelectField>
            <TextField
              id="transfer-amount"
              name="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              label={t("bankTransfer.fields.amount")}
              required
              hint="Example: 100.00"
            />
            <RadioGroupField
              name="executionMode"
              label={t("bankTransfer.fields.execution")}
              value={executionMode}
              onChange={setExecutionMode}
              required
              hint={`Example: ${t("bankTransfer.hints.immediateFree")}`}
              options={[
                { value: "immediate", label: t("bankTransfer.options.immediate") },
                { value: "date", label: t("bankTransfer.options.selectDate") },
              ]}
            />
            {executionMode === "date" ? (
              <TextField
                id="transfer-execution-date"
                name="executionDate"
                type="date"
                label={t("bankTransfer.fields.executionDate")}
                required
                width="full"
              />
            ) : null}
            <TextField
              id="transfer-accounting-text"
              name="accountingTextForYou"
              label={t("bankTransfer.fields.accountingTextForYou")}
              width="full"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" wide>
          {t("bankTransfer.actions.review")}
        </Button>
      </div>
    </form>
  );
}
