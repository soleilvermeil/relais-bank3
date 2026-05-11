"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import {
  saveProfileAction,
  type ProfileFormState,
} from "@/app/actions/profile";
import { Button } from "@/components/atoms/button";
import { TextField } from "@/components/molecules/text-field";
import { SectionTitle } from "@/components/atoms/section-title";

const initialState: ProfileFormState = { errors: {} };

function errorMessage(
  t: (key: string) => string,
  code: string | undefined,
): string | undefined {
  if (!code) return undefined;
  const key = `bankProfile.errors.${code}` as const;
  return t(key);
}

type Props = {
  mode: "onboarding" | "edit";
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  redirectTo: "/" | "/profile";
};

export function ProfileForm({
  mode,
  initialFirstName,
  initialLastName,
  initialEmail,
  redirectTo,
}: Props) {
  const { t } = useTranslation("common");
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState);

  return (
    <main id="main-content" className="py-8">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <header className="mb-5 space-y-2">
          <SectionTitle as="h1">
            {mode === "onboarding"
              ? t("bankProfile.onboarding.title")
              : t("bankProfile.edit.title")}
          </SectionTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "onboarding"
              ? t("bankProfile.onboarding.subtitle")
              : t("bankProfile.edit.subtitle")}
          </p>
          {mode === "edit" ? (
            <p className="text-sm text-muted-foreground">{t("bankProfile.hintEditable")}</p>
          ) : null}
        </header>
        {state.errors.form ? (
          <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage(t, state.errors.form)}
          </p>
        ) : null}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <TextField
            id="firstName"
            name="firstName"
            label={t("bankProfile.fields.firstName")}
            autoComplete="given-name"
            required
            width="full"
            defaultValue={initialFirstName}
            error={errorMessage(t, state.errors.firstName)}
          />
          <TextField
            id="lastName"
            name="lastName"
            label={t("bankProfile.fields.lastName")}
            autoComplete="family-name"
            required
            width="full"
            defaultValue={initialLastName}
            error={errorMessage(t, state.errors.lastName)}
          />
          <TextField
            id="email"
            name="email"
            type="email"
            label={t("bankProfile.fields.email")}
            autoComplete="email"
            required
            width="full"
            defaultValue={initialEmail}
            error={errorMessage(t, state.errors.email)}
          />
          <Button type="submit" wide disabled={pending}>
            {t("bankProfile.actions.save")}
          </Button>
        </form>
      </section>
    </main>
  );
}
