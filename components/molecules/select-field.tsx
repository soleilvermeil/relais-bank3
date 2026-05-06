import type { ReactNode, SelectHTMLAttributes } from "react";
import { Select } from "@/components/atoms/select";
import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children"> & {
  label: string;
  hint?: string;
  required?: boolean;
  width?: FieldWidth;
  children: ReactNode;
};

export function SelectField({
  label,
  hint,
  required = false,
  width = "half",
  id,
  children,
  ...props
}: Props) {
  return (
    <FormFieldShell
      label={label}
      required={required}
      hint={hint}
      width={width}
      labelFor={id}
    >
      <Select id={id} {...props}>
        {children}
      </Select>
    </FormFieldShell>
  );
}
