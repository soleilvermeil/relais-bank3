"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitTransfer } from "@/app/actions/bank";
import { Button } from "@/components/atoms/button";
import { SectionTitle } from "@/components/atoms/section-title";
import { RadioGroupField } from "@/components/molecules/radio-group-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextField } from "@/components/molecules/text-field";
import type { TransferDraft } from "@/lib/bank-types";

export type AccountOption = {
  id: number;
  label: string;
};

type Props = {
  debitAccounts: AccountOption[];
  creditAccounts: AccountOption[];
  initial?: Partial<TransferDraft>;
};

export function BankTransferForm({ debitAccounts, creditAccounts, initial }: Props) {
  const { t } = useTranslation("common");
  const [executionMode, setExecutionMode] = useState<"immediate" | "date">(
    initial?.executionMode === "date" ? "date" : "immediate",
  );
  const [debitAccountError, setDebitAccountError] = useState<string | null>(null);
  const [creditAccountError, setCreditAccountError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [executionDateError, setExecutionDateError] = useState<string | null>(null);

  return (
    <form
      className="space-y-8"
      action={submitTransfer}
      onSubmit={(event) => {
        const form = event.currentTarget;
        const data = new FormData(form);
        const debitAccountValue = String(data.get("debitAccount") ?? "");
        const creditAccountValue = String(data.get("creditAccount") ?? "");
        const amountValue = String(data.get("amount") ?? "").trim();
        const executionModeValue = String(data.get("executionMode") ?? "immediate");
        const executionDateValue = String(data.get("executionDate") ?? "").trim();

        const nextDebitAccountError =
          debitAccountValue === "" ? "Please choose a debit account." : null;
        const nextCreditAccountError =
          creditAccountValue === "" ? "Please choose a credit account." : null;
        const nextAmountError = amountValue === "" ? "Amount is required." : null;
        const nextExecutionDateError =
          executionModeValue === "date" && executionDateValue === ""
            ? "Execution date is required."
            : null;

        setDebitAccountError(nextDebitAccountError);
        setCreditAccountError(nextCreditAccountError);
        setAmountError(nextAmountError);
        setExecutionDateError(nextExecutionDateError);

        if (
          nextDebitAccountError ||
          nextCreditAccountError ||
          nextAmountError ||
          nextExecutionDateError
        ) {
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
      <section aria-labelledby="transfer-details-heading" className="space-y-4">
        <SectionTitle as="h2" id="transfer-details-heading">
          {t("bankTransfer.sections.transferDetails")}
        </SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="transfer-debit"
              name="debitAccount"
              defaultValue={initial?.debitAccount ?? ""}
              label={t("bankTransfer.fields.debitAccount")}
              required
              error={debitAccountError ?? undefined}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setDebitAccountError(next === "" ? "Please choose a debit account." : null);
              }}
            >
                <option value="" disabled>
                  {t("bankTransfer.placeholders.selectDebitAccount")}
                </option>
                {debitAccounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.label}
                  </option>
                ))}
            </SelectField>
            <SelectField
              id="transfer-credit"
              name="creditAccount"
              defaultValue={initial?.creditAccount ?? ""}
              label={t("bankTransfer.fields.creditAccount")}
              required
              error={creditAccountError ?? undefined}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setCreditAccountError(next === "" ? "Please choose a credit account." : null);
              }}
            >
                <option value="" disabled>
                  {t("bankTransfer.placeholders.selectCreditAccount")}
                </option>
                {creditAccounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.label}
                  </option>
                ))}
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
              error={amountError ?? undefined}
              defaultValue={initial?.amount ?? ""}
              onChange={(event) => {
                const next = event.currentTarget.value.trim();
                setAmountError(next === "" ? "Amount is required." : null);
              }}
            />
            <RadioGroupField
              name="executionMode"
              label={t("bankTransfer.fields.execution")}
              value={executionMode}
                onChange={(nextMode) => {
                  setExecutionMode(nextMode);
                  if (nextMode === "immediate") {
                    setExecutionDateError(null);
                  }
                }}
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
                error={executionDateError ?? undefined}
                defaultValue={initial?.executionDate ?? ""}
                onChange={(event) => {
                  const next = event.currentTarget.value.trim();
                  setExecutionDateError(next === "" ? "Execution date is required." : null);
                }}
              />
            ) : null}
            <TextField
              id="transfer-accounting-text"
              name="accountingTextForYou"
              label={t("bankTransfer.fields.accountingTextForYou")}
              width="full"
              defaultValue={initial?.accountingTextForYou ?? ""}
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
