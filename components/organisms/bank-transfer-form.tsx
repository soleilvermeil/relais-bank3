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
            <div>
              <Label htmlFor="transfer-debit">
                {t("bankTransfer.fields.debitAccount")}
                <RequiredMark />
              </Label>
              <Select id="transfer-debit" name="debitAccount" defaultValue="">
                <option value="" disabled>
                  {t("bankTransfer.placeholders.selectDebitAccount")}
                </option>
                <option value="chf-main">CH10 ... 1111 (CHF)</option>
                <option value="savings">CH30 ... 3333 (Savings / Epargne)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-credit">
                {t("bankTransfer.fields.creditAccount")}
                <RequiredMark />
              </Label>
              <Select id="transfer-credit" name="creditAccount" defaultValue="">
                <option value="" disabled>
                  {t("bankTransfer.placeholders.selectCreditAccount")}
                </option>
                <option value="chf-main">CH10 ... 1111 (CHF)</option>
                <option value="savings">CH30 ... 3333 (Savings / Epargne)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-amount">
                {t("bankTransfer.fields.amount")}
                <RequiredMark />
              </Label>
              <Input id="transfer-amount" name="amount" inputMode="decimal" />
              <FieldHint example="100.00" />
            </div>
            <div role="group" aria-labelledby="transfer-execution-label" className="space-y-3">
              <Label id="transfer-execution-label">
                {t("bankTransfer.fields.execution")}
                <RequiredMark />
              </Label>
              <div className="grid gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                  <input
                    type="radio"
                    name="executionMode"
                    value="immediate"
                    className="h-4 w-4 accent-primary"
                    checked={executionMode === "immediate"}
                    onChange={() => setExecutionMode("immediate")}
                  />
                  <span>{t("bankTransfer.options.immediate")}</span>
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5">
                  <input
                    type="radio"
                    name="executionMode"
                    value="date"
                    className="h-4 w-4 accent-primary"
                    checked={executionMode === "date"}
                    onChange={() => setExecutionMode("date")}
                  />
                  <span>{t("bankTransfer.options.selectDate")}</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{t("bankTransfer.hints.immediateFree")}</p>
            </div>
            {executionMode === "date" ? (
              <div className="sm:col-span-2">
                <Label htmlFor="transfer-execution-date">
                  {t("bankTransfer.fields.executionDate")}
                  <RequiredMark />
                </Label>
                <Input id="transfer-execution-date" name="executionDate" type="date" />
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Label htmlFor="transfer-accounting-text">
                {t("bankTransfer.fields.accountingTextForYouOptional")}
                <OptionalMark />
              </Label>
              <Input id="transfer-accounting-text" name="accountingTextForYou" />
            </div>
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
