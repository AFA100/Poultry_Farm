import { type ReactNode } from "react";
import { clsx } from "clsx";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
