import { type ReactNode, useEffect } from "react";
import { clsx } from "clsx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={clsx(
          "relative z-10 w-full max-w-lg rounded-xl border bg-card shadow-xl animate-fade-in",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("px-6 pt-6 pb-4 border-b border-border", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={clsx("text-lg font-semibold text-foreground", className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("text-xs text-muted-foreground mt-1", className)}>{children}</p>;
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("px-6 py-4 border-t border-border flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}
