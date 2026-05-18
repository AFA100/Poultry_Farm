import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeedInventory, createFeedInventory, updateFeedInventory,
  getFeedTransactions, createFeedTransaction,
} from "@/api/feed";
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
import type { FeedInventory, FeedTransaction, Farm } from "@/types";

// ── Inventory form ────────────────────────────────────────────────────────────
type InvForm = { farm: string; quantity: string; unit: "kg" | "bag" };
type InvErrors = Partial<Record<keyof InvForm, string>>;
const EMPTY_INV: InvForm = { farm: "", quantity: "0", unit: "kg" };

function validateInv(f: InvForm): InvErrors {
  const e: InvErrors = {};
  if (!f.farm) e.farm = "Farm is required.";
  if (Number(f.quantity) < 0) e.quantity = "Quantity must be ≥ 0.";
  return e;
}

// ── Transaction form ──────────────────────────────────────────────────────────
type TxForm = { farm: string; type: "IN" | "OUT"; quantity: string; unit: "kg" | "bag"; transaction_date: string; note: string };
type TxErrors = Partial<Record<keyof TxForm, string>>;
const EMPTY_TX: TxForm = { farm: "", type: "IN", quantity: "1", unit: "kg", transaction_date: new Date().toISOString().slice(0, 10), note: "" };

function validateTx(f: TxForm): TxErrors {
  const e: TxErrors = {};
  if (!f.farm) e.farm = "Farm is required.";
  if (Number(f.quantity) <= 0) e.quantity = "Quantity must be > 0.";
  if (!f.transaction_date) e.transaction_date = "Date is required.";
  return e;
}

export default function FeedPage() {
  const qc = useQueryClient();

  const [invOpen, setInvOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<FeedInventory | null>(null);
  const [invForm, setInvForm] = useState<InvForm>(EMPTY_INV);
  const [invErrors, setInvErrors] = useState<InvErrors>({});

  const [txOpen, setTxOpen] = useState(false);
  const [txForm, setTxForm] = useState<TxForm>(EMPTY_TX);
  const [txErrors, setTxErrors] = useState<TxErrors>({});

  const { data: invData, isLoading: invLoading } = useQuery({
    queryKey: ["feed-inventory"],
    queryFn: () => getFeedInventory({ page_size: "200" }),
  });
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["feed-transactions"],
    queryFn: () => getFeedTransactions({ page_size: "200" }),
  });
  const { data: farmsData } = useQuery({
    queryKey: ["farms"],
    queryFn: () => getFarms({ page_size: "200" }),
  });

  const inventory = invData?.data.results ?? [];
  const transactions = txData?.data.results ?? [];
  const farms = farmsData?.data.results ?? [];

  const setI = (k: keyof InvForm, v: string) => {
    setInvForm((f) => ({ ...f, [k]: v }));
    setInvErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setT = (k: keyof TxForm, v: string) => {
    setTxForm((f) => ({ ...f, [k]: v }));
    setTxErrors((e) => ({ ...e, [k]: undefined }));
  };

  const openAddInv = () => {
    setEditingInv(null);
    setInvForm({ ...EMPTY_INV, farm: farms[0]?.id ?? "" });
    setInvErrors({});
    setInvOpen(true);
  };
  const openEditInv = (row: FeedInventory) => {
    setEditingInv(row);
    setInvForm({ farm: row.farm, quantity: String(row.quantity), unit: row.unit as "kg" | "bag" });
    setInvErrors({});
    setInvOpen(true);
  };
  const openAddTx = () => {
    setTxForm({ ...EMPTY_TX, farm: farms[0]?.id ?? "" });
    setTxErrors({});
    setTxOpen(true);
  };

  const invMutation = useMutation({
    mutationFn: (f: InvForm) => {
      const p = { farm: f.farm, quantity: Number(f.quantity), unit: f.unit };
      return editingInv ? updateFeedInventory(editingInv.id, p) : createFeedInventory(p);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-inventory"] }); setInvOpen(false); setEditingInv(null); },
  });

  const txMutation = useMutation({
    mutationFn: (f: TxForm) =>
      createFeedTransaction({ farm: f.farm, type: f.type, quantity: Number(f.quantity), unit: f.unit, transaction_date: f.transaction_date, note: f.note }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-transactions"] }); setTxOpen(false); },
  });

  const handleInvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateInv(invForm);
    if (Object.keys(errs).length) { setInvErrors(errs); return; }
    invMutation.mutate(invForm);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateTx(txForm);
    if (Object.keys(errs).length) { setTxErrors(errs); return; }
    txMutation.mutate(txForm);
  };

  const invColumns: Column<FeedInventory>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "quantity", label: "Quantity", render: (v) => Number(v).toLocaleString() },
    { key: "unit", label: "Unit", render: (v) => (v as string).toUpperCase() },
    { key: "last_updated", label: "Last Updated", render: (v) => new Date(v as string).toLocaleDateString() },
  ];

  const txColumns: Column<FeedTransaction>[] = [
    { key: "farm_name", label: "Farm" },
    { key: "type", label: "Type", render: (v) => <StatusBadge status={v as string} /> },
    { key: "quantity", label: "Quantity", render: (v) => Number(v).toLocaleString() },
    { key: "unit", label: "Unit", render: (v) => (v as string).toUpperCase() },
    { key: "transaction_date", label: "Date", render: (v) => new Date(v as string).toLocaleDateString() },
    { key: "note", label: "Note", render: (v) => (v as string) || "—" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Feed Management" description="Track feed inventory and transactions across farms." />

      <Tabs defaultValue="inventory">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={openAddTx}>Record Transaction</Button>
            <Button size="sm" onClick={openAddInv}>Set Inventory</Button>
          </div>
        </div>

        <TabsContent value="inventory">
          <DataTable columns={invColumns} data={inventory} isLoading={invLoading}
            emptyMessage="No feed inventory records." onEdit={openEditInv} />
        </TabsContent>

        <TabsContent value="transactions">
          <DataTable columns={txColumns} data={transactions} isLoading={txLoading}
            emptyMessage="No feed transactions recorded." />
        </TabsContent>
      </Tabs>

      {/* Inventory Dialog */}
      <Dialog open={invOpen} onClose={() => { setInvOpen(false); setEditingInv(null); }}>
        <DialogHeader>
          <DialogTitle>{editingInv ? "Edit Inventory" : "Set Feed Inventory"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm" required error={invErrors.farm} className="col-span-2">
                <Select value={invForm.farm} onChange={(e) => setI("farm", e.target.value)} error={!!invErrors.farm}>
                  <option value="">Select farm</option>
                  {farms.map((f: Farm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Quantity" required error={invErrors.quantity}>
                <Input type="number" min="0" step="0.01" value={invForm.quantity}
                  onChange={(e) => setI("quantity", e.target.value)} error={!!invErrors.quantity} />
              </FormField>
              <FormField label="Unit">
                <Select value={invForm.unit} onChange={(e) => setI("unit", e.target.value)}>
                  <option value="kg">KG</option>
                  <option value="bag">Bag</option>
                </Select>
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => { setInvOpen(false); setEditingInv(null); }}>Cancel</Button>
            <Button type="submit" size="sm" disabled={invMutation.isPending}>
              {invMutation.isPending ? "Saving…" : editingInv ? "Update Inventory" : "Set Inventory"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={txOpen} onClose={() => setTxOpen(false)}>
        <DialogHeader>
          <DialogTitle>Record Feed Transaction</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTxSubmit}>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm" required error={txErrors.farm} className="col-span-2">
                <Select value={txForm.farm} onChange={(e) => setT("farm", e.target.value)} error={!!txErrors.farm}>
                  <option value="">Select farm</option>
                  {farms.map((f: Farm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Type">
                <Select value={txForm.type} onChange={(e) => setT("type", e.target.value as "IN" | "OUT")}>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </Select>
              </FormField>
              <FormField label="Quantity" required error={txErrors.quantity}>
                <Input type="number" min="0.01" step="0.01" value={txForm.quantity}
                  onChange={(e) => setT("quantity", e.target.value)} error={!!txErrors.quantity} />
              </FormField>
              <FormField label="Unit">
                <Select value={txForm.unit} onChange={(e) => setT("unit", e.target.value)}>
                  <option value="kg">KG</option>
                  <option value="bag">Bag</option>
                </Select>
              </FormField>
              <FormField label="Date" required error={txErrors.transaction_date}>
                <Input type="date" value={txForm.transaction_date}
                  onChange={(e) => setT("transaction_date", e.target.value)} error={!!txErrors.transaction_date} />
              </FormField>
              <FormField label="Note" className="col-span-2">
                <Input value={txForm.note} onChange={(e) => setT("note", e.target.value)} placeholder="Optional note" />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setTxOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={txMutation.isPending}>
              {txMutation.isPending ? "Saving…" : "Record Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
