import { type ElementType } from "react";
import { clsx } from "clsx";

type Variant = "default" | "accent" | "info" | "warning";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ElementType;
  variant?: Variant;
  trend?: number;
  subtitle?: string;
}

const variantStyles: Record<Variant, { card: string; iconBg: string; iconText: string }> = {
  default: {
    card: "bg-gradient-to-br from-amber-500/8 to-transparent",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-700",
  },
  accent: {
    card: "bg-gradient-to-br from-orange-500/10 to-transparent",
    iconBg: "bg-orange-500/15",
    iconText: "text-orange-700",
  },
  info: {
    card: "bg-gradient-to-br from-yellow-500/8 to-transparent",
    iconBg: "bg-yellow-500/15",
    iconText: "text-yellow-700",
  },
  warning: {
    card: "bg-gradient-to-br from-amber-700/8 to-transparent",
    iconBg: "bg-amber-700/15",
    iconText: "text-amber-800",
  },
};

export default function StatsCard({ title, value, icon: Icon, variant = "default", trend, subtitle }: StatsCardProps) {
  const styles = variantStyles[variant];
  return (
    <div className={clsx("rounded-xl border border-border bg-card p-5 shadow-sm", styles.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">{title}</p>
          <p className="mt-2 text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend !== undefined && (
            <p className={clsx("mt-1 text-xs font-medium", trend >= 0 ? "text-emerald-600" : "text-destructive")}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx("rounded-lg p-2.5 shrink-0", styles.iconBg)}>
            <Icon className={clsx("h-5 w-5", styles.iconText)} />
          </div>
        )}
      </div>
    </div>
  );
}
