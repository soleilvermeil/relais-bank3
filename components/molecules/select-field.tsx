import type { ReactNode, SelectHTMLAttributes } from "react";
import { Select } from "@/components/atoms/select";
import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children"> & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  width?: FieldWidth;
  children: ReactNode;
};

export function SelectField({
  label,
  hint,
  error,
  required = false,
  width = "half",
  id,
  children,
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
      <Select
        id={id}
        {...props}
        invalid={hasError}
        aria-invalid={hasError ? "true" : undefined}
      >
        {children}
      </Select>
    </FormFieldShell>
  );
}
