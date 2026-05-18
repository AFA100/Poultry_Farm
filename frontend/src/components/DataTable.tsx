import { type ReactNode, useState } from "react";
import { clsx } from "clsx";
import { AlertDialog } from "./ui/AlertDialog";

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  deleteLoading?: boolean;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  onEdit,
  onDelete,
  deleteLoading,
}: DataTableProps<T>) {
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const hasActions = !!(onEdit || onDelete);
  const totalCols = columns.length + (hasActions ? 1 : 0);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={clsx(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={totalCols} />
                  ))
                : data.length === 0
                ? (
                  <tr>
                    <td colSpan={totalCols} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      {emptyMessage}
                    </td>
                  </tr>
                )
                : data.map((row) => (
                  <tr key={row.id} className="group hover:bg-muted/30 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx("px-4 py-3 text-sm text-foreground", col.className)}
                      >
                        {col.render
                          ? col.render((row as Record<string, unknown>)[col.key], row)
                          : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => setDeleteTarget(row)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && data.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">{data.length} record{data.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete?.(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        loading={deleteLoading}
        description="This record will be permanently deleted."
      />
    </>
  );
}
