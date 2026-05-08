"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/atoms/button";
import { TextField } from "@/components/molecules/text-field";
import { SectionTitle } from "@/components/atoms/section-title";

const initialState: LoginState = { error: null };

export function BankLoginForm() {
  const { t } = useTranslation("common");
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main id="main-content" className="py-8">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <header className="mb-5 space-y-2">
          <SectionTitle as="h1">{t("bankFakeLogin.title")}</SectionTitle>
          <p className="text-sm text-muted-foreground">{t("bankFakeLogin.subtitle")}</p>
        </header>
        <form action={formAction} className="space-y-4">
          <TextField
            id="contractNumber"
            name="contractNumber"
            label={t("bankFakeLogin.fields.contractNumber")}
            autoComplete="username"
            required
            width="full"
            hint={t("bankFakeLogin.hint")}
            error={
              state.error === "invalidCredentials"
                ? t("bankFakeLogin.errors.invalidCredentials")
                : undefined
            }
          />
          <TextField
            id="password"
            name="password"
            type="password"
            label={t("bankFakeLogin.fields.password")}
            autoComplete="current-password"
            required
            width="full"
            error={
              state.error === "invalidCredentials"
                ? t("bankFakeLogin.errors.invalidCredentials")
                : undefined
            }
          />
          <Button type="submit" wide disabled={pending}>
            {t("bankFakeLogin.actions.connect")}
          </Button>
        </form>
      </section>
    </main>
  );
}
