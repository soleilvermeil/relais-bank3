import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/atoms/input";
import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  width?: FieldWidth;
};

export function TextField({
  label,
  hint,
  error,
  required = false,
  width = "half",
  id,
  ...props
}: Props) {
  const hasError = Boolean(error);
  return (
    <FormFieldShell
      label={label}
      required={required}
      hint={hint}
      error={error}
      width={width}
      labelFor={id}
    >
      <Input id={id} {...props} invalid={hasError} aria-invalid={hasError ? "true" : undefined} />
    </FormFieldShell>
  );
}
