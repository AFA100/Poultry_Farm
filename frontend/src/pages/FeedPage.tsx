import { useQuery } from "@tanstack/react-query";
import { getFeedInventory, getFeedTransactions } from "@/api/feed";
import type { FeedInventory, FeedTransaction } from "@/types";

export default function FeedPage() {
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    isError: isInventoryError,
  } = useQuery({ queryKey: ["feedInventory"], queryFn: getFeedInventory });

  const {
    data: transactionData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useQuery({ queryKey: ["feedTransactions"], queryFn: getFeedTransactions });

  const inventory = inventoryData?.data.results ?? [];
  const transactions = transactionData?.data.results ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Feed</h1>
        <p className="text-sm text-gray-500">Inventory and transaction history for feed.</p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Feed Inventory</h2>
            <p className="text-sm text-gray-500">Current feed stock by farm.</p>
          </div>
          <div className="text-sm text-gray-600">Total: {inventoryData?.data.count ?? 0}</div>
        </div>

        {isInventoryLoading && <p className="text-sm text-gray-500">Loading inventory...</p>}
        {isInventoryError && <p className="text-sm text-red-500">Unable to load feed inventory.</p>}

        {!isInventoryLoading && !isInventoryError && (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item: FeedInventory) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.farm_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{item.unit}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{new Date(item.last_updated).toLocaleDateString()}</td>
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
            <h2 className="text-lg font-semibold text-gray-900">Feed Transactions</h2>
            <p className="text-sm text-gray-500">Recent incoming and outgoing feed records.</p>
          </div>
          <div className="text-sm text-gray-600">Total: {transactionData?.data.count ?? 0}</div>
        </div>

        {isTransactionsLoading && <p className="text-sm text-gray-500">Loading transactions...</p>}
        {isTransactionsError && <p className="text-sm text-red-500">Unable to load feed transactions.</p>}

        {!isTransactionsLoading && !isTransactionsError && (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx: FeedTransaction) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{tx.farm_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{tx.type}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{tx.quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{tx.unit}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{new Date(tx.transaction_date).toLocaleDateString()}</td>
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
