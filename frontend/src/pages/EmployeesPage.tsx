import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/api/employees";
import { getFarms } from "@/api/farms";
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
import type { Employee, Farm } from "@/types";

type FormState = {
  full_name: string; role: string; salary: string;
  farm: string; status: string; hire_date: string;
};
type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  full_name: "", role: "farmer", salary: "0",
  farm: "", status: "active", hire_date: new Date().toISOString().slice(0, 10),
};

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.full_name.trim()) e.full_name = "Full name is required.";
  if (!f.farm) e.farm = "Farm is required.";
  if (Number(f.salary) < 0) e.salary = "Salary must be ≥ 0.";
  if (!f.hire_date) e.hire_date = "Hire date is required.";
  return e;
}

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees({ page_size: "200" }),
  });
  const { data: farmsData } = useQuery({
    queryKey: ["farms"],
    queryFn: () => getFarms({ page_size: "200" }),
  });
  const rows = data?.data.results ?? [];
  const farms = farmsData?.data.results ?? [];

  const set = (field: keyof FormState, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, farm: farms[0]?.id ?? "" });
    setErrors({});
    setOpen(true);
  };
  const openEdit = (row: Employee) => {
    setEditing(row);
    setForm({
      full_name: row.full_name, role: row.role, salary: String(row.salary),
      farm: row.farm, status: row.status, hire_date: row.hire_date.slice(0, 10),
    });
    setErrors({});
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); };

  const saveMutation = useMutation({
    mutationFn: (f: FormState) => {
      const payload = {
        full_name: f.full_name, role: f.role, salary: Number(f.salary),
        farm: f.farm, status: f.status, hire_date: f.hire_date,
      };
      return editing ? updateEmployee(editing.id, payload) : createEmployee(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Employee) => deleteEmployee(row.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMutation.mutate(form);
  };

  const columns: Column<Employee>[] = [
    { key: "full_name", label: "Name" },
    { key: "farm_name", label: "Farm" },
    { key: "role", label: "Role", render: (v) => <StatusBadge status={v as string} /> },
    { key: "salary", label: "Salary", render: (v) => `$${Number(v).toLocaleString()}` },
    { key: "hire_date", label: "Hire Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v as string} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Employees" description="Manage farm staff across all locations.">
        <Button onClick={openAdd}>Add Employee</Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyMessage="No employees found."
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row)}
        deleteLoading={deleteMutation.isPending}
      />

      <Dialog open={open} onClose={close}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name" required error={errors.full_name} className="col-span-2">
                <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder="e.g. Ahmad Karimi" error={!!errors.full_name} autoFocus />
              </FormField>
              <FormField label="Farm" required error={errors.farm}>
                <Select value={form.farm} onChange={(e) => set("farm", e.target.value)} error={!!errors.farm}>
                  <option value="">Select farm</option>
                  {farms.map((f: Farm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Role">
                <Select value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="farmer">Farmer</option>
                  <option value="worker">Worker</option>
                  <option value="manager">Manager</option>
                </Select>
              </FormField>
              <FormField label="Salary" error={errors.salary} hint="Monthly salary in USD">
                <Input type="number" min="0" value={form.salary}
                  onChange={(e) => set("salary", e.target.value)} error={!!errors.salary} />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormField>
              <FormField label="Hire Date" required error={errors.hire_date} className="col-span-2">
                <Input type="date" value={form.hire_date}
                  onChange={(e) => set("hire_date", e.target.value)} error={!!errors.hire_date} />
              </FormField>
            </div>
            {saveMutation.isError && (
              <p className="text-xs text-destructive mt-2">Failed to save. Please try again.</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={close}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editing ? "Update Employee" : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
