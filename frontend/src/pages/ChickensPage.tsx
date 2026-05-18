import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChickenBatches, createChickenBatch, updateChickenBatch, deleteChickenBatch,
  getChickenMovements, createChickenMovement,
} from "@/api/chickens";
import { getFarms } from "@/api/farms";
import PageHeader from "@/components/PageHeader";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/Dialog";
import type { ChickenBatch, ChickenMovement, Farm } from "@/types";

// ── Batch form ────────────────────────────────────────────────────────────────
type BatchForm = { farm: string; quantity: string; entry_date: string; source: string; cost_per_unit: string };
type BatchErrors = Partial<Record<keyof BatchForm, string>>;
const EMPTY_BATCH: BatchForm = { farm: "", quantity: "1", entry_date: new Date().toISOString().slice(0, 10), source: "", cost_per_unit: "0" };

function validateBatch(f: BatchForm): BatchErrors {
  const e: BatchErrors = {};
  if (!f.farm) e.farm = "Farm is required.";
  if (Number(f.quantity) <= 0) e.quantity = "Quantity must be > 0.";
  if (!f.entry_date) e.entry_date = "Entry date is required.";
  if (Number(f.cost_per_unit) < 0) e.cost_per_unit = "Cost must be ≥ 0.";
  return e;
}

// ── Movement form ─────────────────────────────────────────────────────────────
type MovForm = { farm: string; batch_id: string; type: "IN" | "OUT"; quantity: string; movement_date: string; reason: string };
type MovErrors = Partial<Record<keyof MovForm, string>>;
const EMPTY_MOV: MovForm = { farm: "", batch_id: "", type: "IN", quantity: "1", movement_date: new Date().toISOString().slice(0, 10), reason: "" };

function validateMov(f: MovForm): MovErrors {
  const e: MovErrors = {};
  if (!f.farm) e.farm = "Farm is required.";
  if (!f.batch_id) e.batch_id = "Batch is required.";
  if (Number(f.quantity) <= 0) e.quantity = "Quantity must be > 0.";
  if (!f.movement_date) e.movement_date = "Date is required.";
  return e;
}

export default function ChickensPage() {
  const qc = useQueryClient();

  // Batch dialog
  const [batchOpen, setBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ChickenBatch | null>(null);
  const [batchForm, setBatchForm] = useState<BatchForm>(EMPTY_BATCH);
  const [batchErrors, setBatchErrors] = useState<BatchErrors>({});

  // Movement dialog
  const [movOpen, setMovOpen] = useState(false);
  const [movForm, setMovForm] = useState<MovForm>(EMPTY_MOV);
  const [movErrors, setMovErrors] = useState<MovErrors>({});

  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ["chicken-batches"],
    queryFn: () => getChickenBatches({ page_size: "200" }),
  });
  const { data: movData, isLoading: movLoading } = useQuery({
    queryKey: ["chicken-movements"],
    queryFn: () => getChickenMovements({ page_size: "200" }),
  });
  const { data: farmsData } = useQuery({
    queryKey: ["farms"],
    queryFn: () => getFarms({ page_size: "200" }),
  });

  const batches = batchData?.data.results ?? [];
  const movements = movData?.data.results ?? [];
  const farms = farmsData?.data.results ?? [];

  // Batches filtered by selected farm in movement form
  const farmBatches = batches.filter((b) => b.farm === movForm.farm);

  const setB = (k: keyof BatchForm, v: string) => {
    setBatchForm((f) => ({ ...f, [k]: v }));
    setBatchErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setM = (k: keyof MovForm, v: string) => {
    setMovForm((f) => ({ ...f, [k]: v }));
    setMovErrors((e) => ({ ...e, [k]: undefined }));
  };

  const openAddBatch = () => {
    setEditingBatch(null);
    setBatchForm({ ...EMPTY_BATCH, farm: farms[0]?.id ?? "" });
    setBatchErrors({});
    setBatchOpen(true);
  };
  const openEditBatch = (row: ChickenBatch) => {
    setEditingBatch(row);
    setBatchForm({ farm: row.farm, quantity: String(row.quantity), entry_date: row.entry_date.slice(0, 10), source: row.source ?? "", cost_per_unit: String(row.cost_per_unit) });
    setBatchErrors({});
    setBatchOpen(true);
  };

  const openAddMov = () => {
    setMovForm({ ...EMPTY_MOV, farm: farms[0]?.id ?? "" });
    setMovErrors({});
    setMovOpen(true);
  };

  const batchMutation = useMutation({
    mutationFn: (f: BatchForm) => {
      const p = { farm: f.farm, quantity: Number(f.quantity), entry_date: f.entry_date, source: f.source, cost_per_unit: Number(f.cost_per_unit) };
      return editingBatch ? updateChickenBatch(editingBatch.id, p) : createChickenBatch(p);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["chicken-batches"] }); setBatchOpen(false); setEditingBatch(null); },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (row: ChickenBatch) => deleteChickenBatch(row.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chicken-batches"] }),
  });

  const movMutation = useMutation({
    mutationFn: (f: MovForm) =>
      createChickenMovement({ farm: f.farm, batch_id: f.batch_id, type: f.type, quantity: Number(f.quantity), movement_date: f.movement_date, reason: f.reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["chicken-movements"] }); setMovOpen(false); },
  });

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBatch(batchForm);
    if (Object.keys(errs).length) { setBatchErrors(errs); return; }
    batchMutation.mutate(batchForm);
  };

  const handleMovSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMov(movForm);
    if (Object.keys(errs).length) { setMovErrors(errs); return; }
    movMutation.mutate(movForm);
  };

  const batchColumns: Column<ChickenBatch>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "quantity", label: "Quantity", render: (v) => Number(v).toLocaleString() },
    { key: "entry_date", label: "Entry Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "source", label: "Source", render: (v) => (v as string) || "—" },
    { key: "cost_per_unit", label: "Cost/Unit", render: (v) => `$${Number(v).toFixed(2)}` },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v as string} /> },
  ];

  const movColumns: Column<ChickenMovement>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "batch_id", label: "Batch ID", render: (v) => <span className="font-mono text-xs">{(v as string).slice(0, 8)}…</span> },
    { key: "type", label: "Type", render: (v) => <StatusBadge status={v as string} /> },
    { key: "quantity", label: "Quantity", render: (v) => Number(v).toLocaleString() },
    { key: "movement_date", label: "Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "reason", label: "Reason", render: (v) => (v as string) || "—" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Chickens" description="Manage chicken batches and track movements." />

      <Tabs defaultValue="batches">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="movements">Movements</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={openAddMov}>Record Movement</Button>
            <Button size="sm" onClick={openAddBatch}>Add Batch</Button>
          </div>
        </div>

        <TabsContent value="batches">
          <DataTable columns={batchColumns} data={batches} isLoading={batchLoading}
            emptyMessage="No chicken batches found." onEdit={openEditBatch}
            onDelete={(row) => deleteBatchMutation.mutate(row)} deleteLoading={deleteBatchMutation.isPending} />
        </TabsContent>

        <TabsContent value="movements">
          <DataTable columns={movColumns} data={movements} isLoading={movLoading}
            emptyMessage="No movements recorded." />
        </TabsContent>
      </Tabs>

      {/* Batch Dialog */}
      <Dialog open={batchOpen} onClose={() => { setBatchOpen(false); setEditingBatch(null); }}>
        <DialogHeader>
          <DialogTitle>{editingBatch ? "Edit Batch" : "Add Chicken Batch"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleBatchSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm" required error={batchErrors.farm} className="col-span-2">
                <Select value={batchForm.farm} onChange={(e) => setB("farm", e.target.value)} error={!!batchErrors.farm}>
                  <option value="">Select farm</option>
                  {farms.map((f: Farm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Quantity" required error={batchErrors.quantity}>
                <Input type="number" min="1" value={batchForm.quantity}
                  onChange={(e) => setB("quantity", e.target.value)} error={!!batchErrors.quantity} />
              </FormField>
              <FormField label="Cost per Unit" error={batchErrors.cost_per_unit}>
                <Input type="number" min="0" step="0.01" value={batchForm.cost_per_unit}
                  onChange={(e) => setB("cost_per_unit", e.target.value)} error={!!batchErrors.cost_per_unit} />
              </FormField>
              <FormField label="Entry Date" required error={batchErrors.entry_date}>
                <Input type="date" value={batchForm.entry_date}
                  onChange={(e) => setB("entry_date", e.target.value)} error={!!batchErrors.entry_date} />
              </FormField>
              <FormField label="Source">
                <Input value={batchForm.source} onChange={(e) => setB("source", e.target.value)} placeholder="e.g. Local supplier" />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => { setBatchOpen(false); setEditingBatch(null); }}>Cancel</Button>
            <Button type="submit" size="sm" disabled={batchMutation.isPending}>
              {batchMutation.isPending ? "Saving…" : editingBatch ? "Update Batch" : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={movOpen} onClose={() => setMovOpen(false)}>
        <DialogHeader>
          <DialogTitle>Record Movement</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleMovSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm" required error={movErrors.farm} className="col-span-2">
                <Select value={movForm.farm} onChange={(e) => { setM("farm", e.target.value); setM("batch_id", ""); }} error={!!movErrors.farm}>
                  <option value="">Select farm</option>
                  {farms.map((f: Farm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Batch" required error={movErrors.batch_id} className="col-span-2">
                <Select value={movForm.batch_id} onChange={(e) => setM("batch_id", e.target.value)} error={!!movErrors.batch_id} disabled={!movForm.farm}>
                  <option value="">Select batch</option>
                  {farmBatches.map((b) => <option key={b.id} value={b.id}>{b.entry_date} — {b.quantity.toLocaleString()} birds</option>)}
                </Select>
              </FormField>
              <FormField label="Type">
                <Select value={movForm.type} onChange={(e) => setM("type", e.target.value as "IN" | "OUT")}>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </Select>
              </FormField>
              <FormField label="Quantity" required error={movErrors.quantity}>
                <Input type="number" min="1" value={movForm.quantity}
                  onChange={(e) => setM("quantity", e.target.value)} error={!!movErrors.quantity} />
              </FormField>
              <FormField label="Date" required error={movErrors.movement_date}>
                <Input type="date" value={movForm.movement_date}
                  onChange={(e) => setM("movement_date", e.target.value)} error={!!movErrors.movement_date} />
              </FormField>
              <FormField label="Reason">
                <Input value={movForm.reason} onChange={(e) => setM("reason", e.target.value)} placeholder="e.g. mortality, sale" />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setMovOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={movMutation.isPending}>
              {movMutation.isPending ? "Saving…" : "Record Movement"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
