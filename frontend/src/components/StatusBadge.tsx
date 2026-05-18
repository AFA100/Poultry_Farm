import { clsx } from "clsx";

type Status = "active" | "inactive" | "farmer" | "worker" | "manager" | "IN" | "OUT";

const statusStyles: Record<Status, string> = {
  active:   "bg-amber-500/10 text-amber-700 border-amber-500/20",
  inactive: "bg-stone-400/10 text-stone-500 border-stone-400/20",
  farmer:   "bg-orange-500/10 text-orange-700 border-orange-500/20",
  worker:   "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  manager:  "bg-amber-700/10 text-amber-800 border-amber-700/20",
  IN:       "bg-amber-500/10 text-amber-700 border-amber-500/20",
  OUT:      "bg-orange-600/10 text-orange-700 border-orange-600/20",
};

const statusLabels: Record<Status, string> = {
  active: "Active", inactive: "Inactive",
  farmer: "Farmer", worker: "Worker", manager: "Manager",
  IN: "IN", OUT: "OUT",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status as Status;
  const styles = statusStyles[key] ?? "bg-muted text-muted-foreground border-border";
  const label = statusLabels[key] ?? status;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles,
        className
      )}
    >
      {label}
    </span>
  );
}
