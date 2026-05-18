import { type HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "amber" | "orange" | "yellow";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "bg-primary/10 text-primary border-primary/20": variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "bg-destructive/10 text-destructive border-destructive/20": variant === "destructive",
            "text-foreground border": variant === "outline",
            "bg-amber-500/10 text-amber-700 border-amber-500/20": variant === "amber",
            "bg-orange-500/10 text-orange-700 border-orange-500/20": variant === "orange",
            "bg-yellow-500/10 text-yellow-700 border-yellow-500/20": variant === "yellow",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
