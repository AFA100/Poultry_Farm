import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getIncome, createIncome, updateIncome, deleteIncome,
  getCapital, createCapital, updateCapital, deleteCapital,
} from "@/api/finance";
import { getFarms } from "@/api/farms";
import PageHeader from "@/components/PageHeader";
import DataTable, { type Column } from "@/components/DataTable";
import FormField from "@/components/FormField";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import type { Expense, Income, Capital, Farm } from "@/types";

// ── Generic finance form ──────────────────────────────────────────────────────
type FinanceMode = "expense" | "income" | "capital";

type FinanceForm = {
  farm: string; amount: string; date: string;
  category: string; source: string; note: string; description: string;
};
type FinanceErrors = Partial<Record<keyof FinanceForm, string>>;

const EMPTY_FORM: FinanceForm = {
  farm: "", amount: "0", date: new Date().toISOString().slice(0, 10),
  category: "", source: "", note: "", description: "",
};

function validateFinance(f: FinanceForm, mode: FinanceMode): FinanceErrors {
  const e: FinanceErrors = {};
  if (!f.farm) e.farm = "Farm is required.";
  if (Number(f.amount) < 0) e.amount = "Amount must be ≥ 0.";
  if (!f.date) e.date = "Date is required.";
  if (mode === "expense" && !f.category.trim()) e.category = "Category is required.";
  if (mode === "income" && !f.source.trim()) e.source = "Source is required.";
  return e;
}

export default function FinancePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FinanceMode>("expense");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FinanceForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FinanceErrors>({});

  const { data: expData, isLoading: expLoading } = useQuery({ queryKey: ["expenses"], queryFn: () => getExpenses({ page_size: "200" }) });
  const { data: incData, isLoading: incLoading } = useQuery({ queryKey: ["income"], queryFn: () => getIncome({ page_size: "200" }) });
  const { data: capData, isLoading: capLoading } = useQuery({ queryKey: ["capital"], queryFn: () => getCapital({ page_size: "200" }) });
  const { data: farmsData } = useQuery({ queryKey: ["farms"], queryFn: () => getFarms({ page_size: "200" }) });

  const expenses = expData?.data.results ?? [];
  const incomes = incData?.data.results ?? [];
  const capitals = capData?.data.results ?? [];
  const farms = farmsData?.data.results ?? [];

  const totalIncome = incomes.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);

  const set = (k: keyof FinanceForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const openAdd = (m: FinanceMode) => {
    setMode(m); setEditingId(null);
    setForm({ ...EMPTY_FORM, farm: farms[0]?.id ?? "" });
    setErrors({}); setOpen(true);
  };

  const openEdit = (m: FinanceMode, row: Expense | Income | Capital) => {
    setMode(m); setEditingId(row.id);
    if (m === "expense") {
      const r = row as Expense;
      setForm({ ...EMPTY_FORM, farm: r.farm, amount: String(r.amount), date: r.expense_date.slice(0, 10), category: r.category, description: r.description ?? "" });
    } else if (m === "income") {
      const r = row as Income;
      setForm({ ...EMPTY_FORM, farm: r.farm, amount: String(r.amount), date: r.income_date.slice(0, 10), source: r.source, description: r.description ?? "" });
    } else {
      const r = row as Capital;
      setForm({ ...EMPTY_FORM, farm: r.farm, amount: String(r.amount), date: r.investment_date.slice(0, 10), note: r.note ?? "" });
    }
    setErrors({}); setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (f: FinanceForm): Promise<unknown> => {
      if (mode === "expense") {
        const p = { farm: f.farm, category: f.category, amount: Number(f.amount), expense_date: f.date, description: f.description };
        return editingId ? updateExpense(editingId, p) : createExpense(p);
      } else if (mode === "income") {
        const p = { farm: f.farm, source: f.source, amount: Number(f.amount), income_date: f.date, description: f.description };
        return editingId ? updateIncome(editingId, p) : createIncome(p);
      } else {
        const p = { farm: f.farm, amount: Number(f.amount), investment_date: f.date, note: f.note };
        return editingId ? updateCapital(editingId, p) : createCapital(p);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["capital"] });
      setOpen(false); setEditingId(null);
    },
  });

  const delExpMutation = useMutation({ mutationFn: (r: Expense) => deleteExpense(r.id), onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }) });
  const delIncMutation = useMutation({ mutationFn: (r: Income) => deleteIncome(r.id), onSuccess: () => qc.invalidateQueries({ queryKey: ["income"] }) });
  const delCapMutation = useMutation({ mutationFn: (r: Capital) => deleteCapital(r.id), onSuccess: () => qc.invalidateQueries({ queryKey: ["capital"] }) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateFinance(form, mode);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMutation.mutate(form);
  };

  const expColumns: Column<Expense>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: (v) => `$${Number(v).toLocaleString()}` },
    { key: "expense_date", label: "Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "description", label: "Description", render: (v) => (v as string) || "—" },
  ];
  const incColumns: Column<Income>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "source", label: "Source" },
    { key: "amount", label: "Amount", render: (v) => `$${Number(v).toLocaleString()}` },
    { key: "income_date", label: "Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "description", label: "Description", render: (v) => (v as string) || "—" },
  ];
  const capColumns: Column<Capital>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "amount", label: "Amount", render: (v) => `$${Number(v).toLocaleString()}` },
    { key: "investment_date", label: "Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "note", label: "Note", render: (v) => (v as string) || "—" },
  ];

  const dialogTitle = { expense: "Expense", income: "Income", capital: "Capital Investment" }[mode];
  const dateLabel = { expense: "Expense Date", income: "Income Date", capital: "Investment Date" }[mode];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Finance" description="Track income, expenses, and capital investments." />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Income" value={`$${totalIncome.toLocaleString()}`} variant="default" />
        <StatsCard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} variant="accent" />
        <StatsCard
          title="Net Profit"
          value={`$${(totalIncome - totalExpenses).toLocaleString()}`}
          variant={totalIncome >= totalExpenses ? "default" : "warning"}
          subtitle={totalIncome >= totalExpenses ? "Profitable" : "Loss"}
        />
      </div>

      <Tabs defaultValue="expenses">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="capital">Capital</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openAdd("income")}>Add Income</Button>
            <Button size="sm" variant="outline" onClick={() => openAdd("capital")}>Add Capital</Button>
            <Button size="sm" onClick={() => openAdd("expense")}>Add Expense</Button>
          </div>
        </div>

        <TabsContent value="expenses">
          <DataTable columns={expColumns} data={expenses} isLoading={expLoading}
            emptyMessage="No expenses recorded."
            onEdit={(row) => openEdit("expense", row)}
            onDelete={(row) => delExpMutation.mutate(row)}
            deleteLoading={delExpMutation.isPending} />
        </TabsContent>

        <TabsContent value="income">
          <DataTable columns={incColumns} data={incomes} isLoading={incLoading}
            emptyMessage="No income recorded."
            onEdit={(row) => openEdit("income", row)}
            onDelete={(row) => delIncMutation.mutate(row)}
            deleteLoading={delIncMutation.isPending} />
        </TabsContent>

        <TabsContent value="capital">
          <DataTable columns={capColumns} data={capitals} isLoading={capLoading}
            emptyMessage="No capital investments recorded."
            onEdit={(row) => openEdit("capital", row)}
            onDelete={(row) => delCapMutation.mutate(row)}
            deleteLoading={delCapMutation.isPending} />
        </TabsContent>
      </Tabs>

      {/* Unified Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditingId(null); }}>
        <DialogHeader>
          <DialogTitle>{editingId ? `Edit ${dialogTitle}` : `Add ${dialogTitle}`}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm" required error={errors.farm} className="col-span-2">
                <Select value={form.farm} onChange={(e) => set("farm", e.target.value)} error={!!errors.farm}>
                  <option value="">Select farm</option>
                  {farms.map((f: Farm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Amount" required error={errors.amount}>
                <Input type="number" min="0" step="0.01" value={form.amount}
                  onChange={(e) => set("amount", e.target.value)} error={!!errors.amount} />
              </FormField>
              <FormField label={dateLabel} required error={errors.date}>
                <Input type="date" value={form.date}
                  onChange={(e) => set("date", e.target.value)} error={!!errors.date} />
              </FormField>
              {mode === "expense" && (
                <FormField label="Category" required error={errors.category} className="col-span-2">
                  <Input value={form.category} onChange={(e) => set("category", e.target.value)}
                    placeholder="e.g. Feed, Veterinary, Utilities" error={!!errors.category} />
                </FormField>
              )}
              {mode === "income" && (
                <FormField label="Source" required error={errors.source} className="col-span-2">
                  <Input value={form.source} onChange={(e) => set("source", e.target.value)}
                    placeholder="e.g. Egg sales, Meat sales" error={!!errors.source} />
                </FormField>
              )}
              {(mode === "expense" || mode === "income") && (
                <FormField label="Description" className="col-span-2">
                  <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" />
                </FormField>
              )}
              {mode === "capital" && (
                <FormField label="Note" className="col-span-2">
                  <Input value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Optional note" />
                </FormField>
              )}
            </div>
            {saveMutation.isError && (
              <p className="text-xs text-destructive mt-2">Failed to save. Please try again.</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => { setOpen(false); setEditingId(null); }}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editingId ? `Update ${dialogTitle}` : `Create ${dialogTitle}`}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
