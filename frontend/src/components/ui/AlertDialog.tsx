import { type ReactNode } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "./Dialog";
import { Button } from "./Button";

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  children?: ReactNode;
}

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
}: AlertDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p className="text-sm text-muted-foreground">{description}</p>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting…" : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
