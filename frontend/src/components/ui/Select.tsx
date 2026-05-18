import { forwardRef, type SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        className={clsx(
          "flex h-10 w-full items-center justify-between rounded-md border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-input",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
