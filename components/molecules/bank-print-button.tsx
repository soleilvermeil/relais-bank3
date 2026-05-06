"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/atoms/button";

type Props = {
  label: string;
};

export function BankPrintButton({ label }: Props) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Button>
  );
}
