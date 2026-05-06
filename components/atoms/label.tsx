import type { LabelHTMLAttributes, ReactNode } from "react";

type Props = Omit<LabelHTMLAttributes<HTMLLabelElement>, "className"> & {
  children: ReactNode;
};

export function Label({ children, ...rest }: Props) {
  return (
    <label
      className="mb-1.5 block text-sm font-medium text-foreground"
      {...rest}
    >
      {children}
    </label>
  );
}
