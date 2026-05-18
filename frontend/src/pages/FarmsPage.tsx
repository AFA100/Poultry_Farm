import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFarms, createFarm, updateFarm, deleteFarm } from "@/api/farms";
import { getProvinces } from "@/api/provinces";
import PageHeader from "@/components/PageHeader";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import type { Farm, Province } from "@/types";

type FormState = { name: string; province: string; location: string; capacity: string };
type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = { name: "", province: "", location: "", capacity: "0" };

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Farm name is required.";
  if (!f.province) e.province = "Province is required.";
  if (Number(f.capacity) < 0) e.capacity = "Capacity must be ≥ 0.";
  return e;
}

export default function FarmsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Farm | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const { data, isLoading } = useQuery({
    queryKey: ["farms"],
    queryFn: () => getFarms({ page_size: "200" }),
  });
  const { data: provData } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => getProvinces({ page_size: "200" }),
  });
  const rows = data?.data.results ?? [];
  const provinces = provData?.data.results ?? [];

  const set = (field: keyof FormState, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, province: provinces[0]?.id ?? "" });
    setErrors({});
    setOpen(true);
  };
  const openEdit = (row: Farm) => {
    setEditing(row);
    setForm({ name: row.name, province: row.province, location: row.location ?? "", capacity: String(row.capacity) });
    setErrors({});
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); };

  const saveMutation = useMutation({
    mutationFn: (f: FormState) => {
      const payload = { name: f.name, province: f.province, location: f.location, capacity: Number(f.capacity) };
      return editing ? updateFarm(editing.id, payload) : createFarm(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["farms"] }); close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Farm) => deleteFarm(row.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farms"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMutation.mutate(form);
  };

  const columns: Column<Farm>[] = [
    { key: "name", label: "Farm Name" },
    { key: "province_name", label: "Province" },
    { key: "location", label: "Location", render: (v) => (v as string) || "—" },
    { key: "capacity", label: "Capacity", render: (v) => Number(v).toLocaleString() },
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
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Farms" description="Manage farm locations across all provinces.">
        <Button onClick={openAdd}>Add Farm</Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyMessage="No farms found."
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row)}
        deleteLoading={deleteMutation.isPending}
      />

      <Dialog open={open} onClose={close}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Farm" : "Add Farm"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm Name" required error={errors.name} className="col-span-2">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. North Farm" error={!!errors.name} autoFocus />
              </FormField>
              <FormField label="Province" required error={errors.province}>
                <Select value={form.province} onChange={(e) => set("province", e.target.value)} error={!!errors.province}>
                  <option value="">Select province</option>
                  {provinces.map((p: Province) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Capacity" error={errors.capacity} hint="Number of chickens">
                <Input type="number" min="0" value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)} error={!!errors.capacity} />
              </FormField>
              <FormField label="Location" className="col-span-2">
                <Input value={form.location} onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. District 3, Kabul" />
              </FormField>
            </div>
            {saveMutation.isError && (
              <p className="text-xs text-destructive mt-2">Failed to save. Please try again.</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={close}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editing ? "Update Farm" : "Create Farm"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
