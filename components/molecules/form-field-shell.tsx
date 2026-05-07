import type { ReactNode } from "react";
import { FieldHint } from "@/components/atoms/field-hint";
import { Label } from "@/components/atoms/label";

export type FieldWidth = "half" | "full";

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  width?: FieldWidth;
  labelFor?: string;
  labelId?: string;
  children: ReactNode;
};

function RequiredMark() {
  return <span className="ml-1 text-red-600">*</span>;
}

function OptionalMark() {
  return <span className="ml-1 text-muted-foreground">(optional)</span>;
}

export function FormFieldShell({
  label,
  required = false,
  hint,
  error,
  width = "half",
  labelFor,
  labelId,
  children,
}: Props) {
  return (
    <div className={width === "full" ? "sm:col-span-2" : undefined}>
      <Label htmlFor={labelFor} id={labelId}>
        {label}
        {required ? <RequiredMark /> : <OptionalMark />}
      </Label>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {children}
      <FieldHint hint={hint ?? "\u00A0"} />
    </div>
  );
}
