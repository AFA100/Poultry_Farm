import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, createRole, updateRole, deleteRole } from "@/api/roles";
import { getPermissions } from "@/api/permissions";
import PageHeader from "@/components/PageHeader";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import type { Role, Permission } from "@/types/admin";

type RoleForm = { name: string; description: string; permission_ids: string[] };
type RoleErrors = Partial<Record<"name" | "description", string>>;

function validate(f: RoleForm): RoleErrors {
  const e: RoleErrors = {};
  if (!f.name.trim()) e.name = "Role name is required.";
  return e;
}

// Group permissions by module for the checkbox list
function groupByModule(perms: Permission[]): Record<string, Permission[]> {
  return perms.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] = acc[p.module] ?? []).push(p);
    return acc;
  }, {});
}

export default function RolesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleForm>({ name: "", description: "", permission_ids: [] });
  const [errors, setErrors] = useState<RoleErrors>({});
  const [permSearch, setPermSearch] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["roles"], queryFn: () => getRoles({ page_size: "200" }) });
  const { data: permsData } = useQuery({ queryKey: ["permissions"], queryFn: () => getPermissions({ page_size: "500" }) });

  const rows: Role[] = data?.data?.results ?? [];
  const allPerms: Permission[] = permsData?.data?.results ?? [];

  const filteredPerms = permSearch
    ? allPerms.filter((p) =>
        p.permission_key.includes(permSearch.toLowerCase()) ||
        p.module.includes(permSearch.toLowerCase())
      )
    : allPerms;

  const grouped = groupByModule(filteredPerms);

  const set = (k: keyof RoleForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const togglePerm = (id: string) =>
    setForm((f) => ({
      ...f,
      permission_ids: f.permission_ids.includes(id)
        ? f.permission_ids.filter((x) => x !== id)
        : [...f.permission_ids, id],
    }));

  const toggleModule = (module: string) => {
    const moduleIds = (grouped[module] ?? []).map((p) => p.id);
    const allSelected = moduleIds.every((id) => form.permission_ids.includes(id));
    setForm((f) => ({
      ...f,
      permission_ids: allSelected
        ? f.permission_ids.filter((id) => !moduleIds.includes(id))
        : [...new Set([...f.permission_ids, ...moduleIds])],
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", permission_ids: [] });
    setErrors({});
    setPermSearch("");
    setOpen(true);
  };

  const openEdit = (row: Role) => {
    setEditing(row);
    // Fetch detail to get permission keys, then map to IDs
    const permKeys = row.permissions ?? [];
    const ids = allPerms.filter((p) => permKeys.includes(p.permission_key)).map((p) => p.id);
    setForm({ name: row.name, description: row.description ?? "", permission_ids: ids });
    setErrors({});
    setPermSearch("");
    setOpen(true);
  };

  const close = () => { setOpen(false); setEditing(null); };

  const saveMutation = useMutation({
    mutationFn: (f: RoleForm) =>
      editing
        ? updateRole(editing.id, { name: f.name, description: f.description, permission_ids: f.permission_ids })
        : createRole({ name: f.name, description: f.description, permission_ids: f.permission_ids }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["roles"] }); close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Role) => deleteRole(row.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMutation.mutate(form);
  };

  const columns: Column<Role>[] = [
    { key: "name", label: "Role Name" },
    { key: "description", label: "Description", render: (v) => (v as string) || "—" },
    {
      key: "is_active",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
    {
      key: "is_system",
      label: "Type",
      render: (v) => v
        ? <span className="text-xs bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full px-2 py-0.5">System</span>
        : <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">Custom</span>,
    },
    {
      key: "created_at",
      label: "Created",
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Roles" description="Define roles and assign permissions to them.">
        <Button onClick={openAdd}>Add Role</Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyMessage="No roles found."
        onEdit={openEdit}
        onDelete={(row) => !row.is_system && deleteMutation.mutate(row)}
        deleteLoading={deleteMutation.isPending}
      />

      <Dialog open={open} onClose={close} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
          <DialogDescription>Fields marked * are required. Select permissions to assign.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role Name" required error={errors.name}>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Farm Manager" error={!!errors.name} autoFocus />
              </FormField>
              <FormField label="Description">
                <Input value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Optional description" />
              </FormField>
            </div>

            {/* Permissions picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  Permissions
                  <span className="ml-2 text-xs text-muted-foreground">({form.permission_ids.length} selected)</span>
                </p>
                <Input
                  placeholder="Search…"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="h-7 w-40 text-xs"
                />
              </div>
              <div className="border border-border rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                {Object.entries(grouped).map(([module, perms]) => {
                  const moduleIds = perms.map((p) => p.id);
                  const allSel = moduleIds.every((id) => form.permission_ids.includes(id));
                  const someSel = moduleIds.some((id) => form.permission_ids.includes(id));
                  return (
                    <div key={module}>
                      {/* Module header */}
                      <button
                        type="button"
                        onClick={() => toggleModule(module)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
                      >
                        <span
                          className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                            allSel ? "bg-primary border-primary" : someSel ? "bg-primary/40 border-primary/40" : "border-border bg-card"
                          }`}
                        >
                          {(allSel || someSel) && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={allSel ? "M5 13l4 4L19 7" : "M5 12h14"} />
                            </svg>
                          )}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{module}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{perms.length}</span>
                      </button>
                      {/* Permission rows */}
                      <div className="divide-y divide-border/50">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={form.permission_ids.includes(perm.id)}
                              onChange={() => togglePerm(perm.id)}
                              className="accent-primary h-3.5 w-3.5"
                            />
                            <span className="text-xs font-mono text-foreground">{perm.action}</span>
                            {perm.description && (
                              <span className="text-xs text-muted-foreground truncate">{perm.description}</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(grouped).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No permissions found.</p>
                )}
              </div>
            </div>

            {saveMutation.isError && (
              <p className="text-xs text-destructive">Failed to save. Please try again.</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={close}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editing ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
