import type { TextareaHTMLAttributes } from "react";
import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  label: string;
  hint?: string;
  required?: boolean;
  width?: FieldWidth;
};

export function TextareaField({
  label,
  hint,
  required = false,
  width = "half",
  id,
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
      <textarea
        id={id}
        className="box-border w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-base text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
        {...props}
      />
    </FormFieldShell>
  );
}
