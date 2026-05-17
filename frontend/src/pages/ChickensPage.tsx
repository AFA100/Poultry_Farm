import { useQuery } from "@tanstack/react-query";
import { getChickenBatches, getChickenMovements } from "@/api/chickens";
import type { ChickenBatch, ChickenMovement } from "@/types";

export default function ChickensPage() {
  const {
    data: batchData,
    isLoading: isBatchesLoading,
    isError: isBatchesError,
  } = useQuery({ queryKey: ["chickenBatches"], queryFn: getChickenBatches });

  const {
    data: movementData,
    isLoading: isMovementsLoading,
    isError: isMovementsError,
  } = useQuery({ queryKey: ["chickenMovements"], queryFn: getChickenMovements });

  const batches = batchData?.data.results ?? [];
  const movements = movementData?.data.results ?? [];

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Chickens</h1>
        <p className="text-sm text-gray-500">Chicken inventory and movement history.</p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chicken Batches</h2>
            <p className="text-sm text-gray-500">Active batches across farms.</p>
          </div>
          <div className="text-sm text-gray-600">Total: {batchData?.data.count ?? 0}</div>
        </div>

        {isBatchesLoading && <p className="text-sm text-gray-500">Loading chicken batches...</p>}
        {isBatchesError && <p className="text-sm text-red-500">Failed to load batches.</p>}

        {!isBatchesLoading && !isBatchesError && (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Entry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((batch: ChickenBatch) => (
                  <tr key={batch.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{batch.farm_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{batch.quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{new Date(batch.entry_date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{batch.source}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{batch.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Movement History</h2>
            <p className="text-sm text-gray-500">Recent chicken movement records.</p>
          </div>
          <div className="text-sm text-gray-600">Total: {movementData?.data.count ?? 0}</div>
        </div>

        {isMovementsLoading && <p className="text-sm text-gray-500">Loading movements...</p>}
        {isMovementsError && <p className="text-sm text-red-500">Failed to load movements.</p>}

        {!isMovementsLoading && !isMovementsError && (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((movement: ChickenMovement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{movement.farm_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{movement.batch_id}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{movement.type}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{movement.quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{new Date(movement.movement_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
