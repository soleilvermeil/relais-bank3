import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/atoms/input";
import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  hint?: string;
  required?: boolean;
  width?: FieldWidth;
};

export function TextField({ label, hint, required = false, width = "half", id, ...props }: Props) {
  return (
    <FormFieldShell
      label={label}
      required={required}
      hint={hint}
      width={width}
      labelFor={id}
    >
      <Input id={id} {...props} />
    </FormFieldShell>
  );
}
