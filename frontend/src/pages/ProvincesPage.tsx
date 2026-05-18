import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getProvinces, createProvince, updateProvince, deleteProvince } from "@/api/provinces";
import PageHeader from "@/components/PageHeader";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import type { Province } from "@/types";

type FormState = { name: string };
type Errors = Partial<FormState>;

const EMPTY: FormState = { name: "" };

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Province name is required.";
  return e;
}

export default function ProvincesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Province | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const { data, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => getProvinces({ page_size: "200" }),
  });
  const rows = data?.data.results ?? [];

  const set = (field: keyof FormState, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setErrors({}); setOpen(true); };
  const openEdit = (row: Province) => {
    setEditing(row);
    setForm({ name: row.name });
    setErrors({});
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); };

  const saveMutation = useMutation({
    mutationFn: (f: FormState) =>
      editing ? updateProvince(editing.id, f) : createProvince(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provinces"] }); close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Province) => deleteProvince(row.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provinces"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMutation.mutate(form);
  };

  const columns: Column<Province>[] = [
    { key: "name", label: "Province Name" },
    {
      key: "is_active",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
    { key: "farm_count", label: "Farms" },
    {
      key: "created_at",
      label: "Created",
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Dashboard",
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/provinces/${row.id}/dashboard`); }}
          className="text-xs text-primary hover:underline font-medium"
        >
          View →
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Provinces" description="Manage provinces and view per-province dashboards.">
        <Button onClick={openAdd}>Add Province</Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyMessage="No provinces found."
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row)}
        deleteLoading={deleteMutation.isPending}
      />

      <Dialog open={open} onClose={close}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Province" : "Add Province"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <FormField label="Province Name" required error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kandahar"
                error={!!errors.name}
                autoFocus
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={close}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editing ? "Update Province" : "Create Province"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
