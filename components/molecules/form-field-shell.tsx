import type { ReactNode } from "react";
import { FieldHint } from "@/components/atoms/field-hint";
import { Label } from "@/components/atoms/label";

export type FieldWidth = "half" | "full";

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
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
      {children}
      {hint ? <FieldHint hint={hint} /> : null}
    </div>
  );
}
