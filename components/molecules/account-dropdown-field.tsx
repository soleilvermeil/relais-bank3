"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";
import { formatChfCurrency } from "@/lib/bank-money";

export type AccountDropdownOption = {
  id: number;
  name: string;
  identifier: string;
  balance: number;
};

type Props = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: AccountDropdownOption[];
  value: string;
  onChange: (nextValue: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  width?: FieldWidth;
};

export function AccountDropdownField({
  id,
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  hint,
  error,
  width = "full",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => String(option.id) === value) ?? null;
  const hasError = Boolean(error);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <FormFieldShell
      label={label}
      required={required}
      hint={hint}
      error={error}
      width={width}
      labelFor={id}
    >
      <div ref={rootRef} className="relative mt-1">
        <input type="hidden" id={id} name={name} value={value} />
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={id}
          onClick={() => setOpen((prev) => !prev)}
          className={`box-border flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2 text-left text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 ${
            hasError
              ? "border-red-600 focus-visible:border-red-600 focus-visible:ring-red-500"
              : "border-card-border focus-visible:border-primary focus-visible:ring-ring"
          }`}
        >
          {selectedOption ? (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{selectedOption.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {selectedOption.identifier}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {formatChfCurrency(selectedOption.balance)}
              </span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className={`size-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div
            role="listbox"
            className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-card-border bg-card p-1 shadow-lg"
          >
            {options.map((option) => {
              const optionValue = String(option.id);
              const isSelected = optionValue === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(optionValue);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left transition ${
                    isSelected ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{option.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.identifier}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatChfCurrency(option.balance)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </FormFieldShell>
  );
}
