import { FormFieldShell, type FieldWidth } from "@/components/molecules/form-field-shell";

type RadioOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  label: string;
  required?: boolean;
  hint?: string;
  width?: FieldWidth;
  columns?: 1 | 2;
  labelId?: string;
};

export function RadioGroupField<T extends string>({
  name,
  value,
  onChange,
  options,
  label,
  required = false,
  hint,
  width = "full",
  columns = 2,
  labelId,
}: Props<T>) {
  const resolvedLabelId = labelId ?? `${name}-label`;
  return (
    <div
      role="group"
      aria-labelledby={resolvedLabelId}
      className={`${width === "full" ? "sm:col-span-2 " : ""}space-y-3`}
    >
      <FormFieldShell
        label={label}
        required={required}
        hint={hint}
        width="half"
        labelId={resolvedLabelId}
      >
        <div className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 rounded-xl border border-card-border px-3 py-2.5"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                className="h-4 w-4 accent-primary"
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </FormFieldShell>
    </div>
  );
}
