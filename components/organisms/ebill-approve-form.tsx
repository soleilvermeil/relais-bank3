"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { approveEbillAction } from "@/app/actions/ebills";
import { Button } from "@/components/atoms/button";
import {
  AccountDropdownField,
  type AccountDropdownOption,
} from "@/components/molecules/account-dropdown-field";

type Props = {
  ebillId: number;
  debitAccounts: AccountDropdownOption[];
};

export function EbillApproveForm({ ebillId, debitAccounts }: Props) {
  const { t } = useTranslation("common");
  const [debitAccountId, setDebitAccountId] = useState(
    debitAccounts[0] != null ? String(debitAccounts[0].id) : "",
  );
  const [debitError, setDebitError] = useState<string | null>(null);

  return (
    <form
      action={approveEbillAction}
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        const nextError =
          debitAccountId === "" ? t("bankPayment.errors.debitAccountRequired") : null;
        setDebitError(nextError);
        if (nextError != null) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="ebillId" value={String(ebillId)} />
      <AccountDropdownField
        id="ebill-debit-account"
        name="debitAccountId"
        label={t("bankPayment.fields.debitAccount")}
        placeholder={t("bankPayment.placeholders.selectDebitAccount")}
        options={debitAccounts}
        value={debitAccountId}
        onChange={setDebitAccountId}
        required
        error={debitError ?? undefined}
      />
      <Button type="submit" wide>
        {t("bankEbills.actions.approve")}
      </Button>
    </form>
  );
}
