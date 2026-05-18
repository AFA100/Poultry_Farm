import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser, getUserRoles, assignUserRoles } from "@/api/users";
import { getRoles } from "@/api/roles";
import PageHeader from "@/components/PageHeader";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import type { User, Role, UserRoleEntry } from "@/types/admin";

// ── User form ─────────────────────────────────────────────────────────────────
type UserForm = { full_name: string; email: string; password: string; is_active: boolean };
type UserErrors = Partial<Record<keyof UserForm, string>>;

function validateUser(f: UserForm, isEdit: boolean): UserErrors {
  const e: UserErrors = {};
  if (!f.full_name.trim()) e.full_name = "Full name is required.";
  if (!f.email.trim()) e.email = "Email is required.";
  if (!isEdit && !f.password.trim()) e.password = "Password is required.";
  if (!isEdit && f.password && f.password.length < 8) e.password = "Password must be at least 8 characters.";
  return e;
}

// ── Role assignment dialog ────────────────────────────────────────────────────
function RoleAssignDialog({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { data: rolesData } = useQuery({ queryKey: ["roles"], queryFn: () => getRoles({ page_size: "200" }) });
  const { data: userRolesData } = useQuery({
    queryKey: ["user-roles", user.id],
    queryFn: () => getUserRoles(user.id),
  });

  const allRoles: Role[] = rolesData?.data?.results ?? [];
  const assigned: string[] = (userRolesData?.data ?? []).map((r: UserRoleEntry) => r.role_id);
  const [selected, setSelected] = useState<string[]>(assigned);

  // Sync once loaded
  const [synced, setSynced] = useState(false);
  if (!synced && assigned.length > 0) { setSelected(assigned); setSynced(true); }

  const mutation = useMutation({
    mutationFn: () => assignUserRoles(user.id, selected),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-roles", user.id] });
      onClose();
    },
  });

  const toggle = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <Dialog open onClose={onClose} className="max-w-md">
      <DialogHeader>
        <DialogTitle>Assign Roles — {user.full_name}</DialogTitle>
        <DialogDescription>Select roles to assign to this user.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {allRoles.map((role) => (
            <label
              key={role.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(role.id)}
                onChange={() => toggle(role.id)}
                className="accent-primary h-4 w-4"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{role.name}</p>
                {role.description && <p className="text-xs text-muted-foreground truncate">{role.description}</p>}
              </div>
              {role.is_system && (
                <span className="ml-auto text-xs bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full px-2 py-0.5 shrink-0">
                  system
                </span>
              )}
            </label>
          ))}
          {allRoles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No roles found.</p>}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Saving…" : "Save Roles"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>({ full_name: "", email: "", password: "", is_active: true });
  const [errors, setErrors] = useState<UserErrors>({});

  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: () => getUsers({ page_size: "200" }) });
  const rows: User[] = data?.data?.results ?? [];

  const set = (k: keyof UserForm, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ full_name: "", email: "", password: "", is_active: true });
    setErrors({});
    setOpen(true);
  };
  const openEdit = (row: User) => {
    setEditing(row);
    setForm({ full_name: row.full_name, email: row.email, password: "", is_active: row.is_active });
    setErrors({});
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); };

  const saveMutation = useMutation({
    mutationFn: (f: UserForm) => {
      if (editing) {
        return updateUser(editing.id, { full_name: f.full_name, email: f.email, is_active: f.is_active });
      }
      return createUser({ full_name: f.full_name, email: f.email, password: f.password });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: User) => deleteUser(row.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateUser(form, !!editing);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMutation.mutate(form);
  };

  const columns: Column<User>[] = [
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    {
      key: "is_active",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Roles",
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setRoleUser(row); }}
          className="text-xs text-primary hover:underline font-medium"
        >
          Manage roles
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Users" description="Manage system user accounts.">
        <Button onClick={openAdd}>Add User</Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyMessage="No users found."
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row)}
        deleteLoading={deleteMutation.isPending}
      />

      {/* Create / Edit dialog */}
      <Dialog open={open} onClose={close}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <FormField label="Full Name" required error={errors.full_name}>
                <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder="e.g. Ahmad Karimi" error={!!errors.full_name} autoFocus />
              </FormField>
              <FormField label="Email" required error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="user@example.com" error={!!errors.email} />
              </FormField>
              {!editing && (
                <FormField label="Password" required error={errors.password} hint="Minimum 8 characters">
                  <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••••" error={!!errors.password} />
                </FormField>
              )}
              {editing && (
                <FormField label="Status">
                  <select
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(e) => set("is_active", e.target.value === "active")}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>
              )}
              {saveMutation.isError && (
                <p className="text-xs text-destructive">Failed to save. Please try again.</p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={close}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editing ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Role assignment dialog */}
      {roleUser && <RoleAssignDialog user={roleUser} onClose={() => setRoleUser(null)} />}
    </div>
  );
}
