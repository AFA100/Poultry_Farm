import { useQuery } from "@tanstack/react-query";
import { getProfitLossReport } from "@/api/reports";

export default function ReportsPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["profitLossReport"], queryFn: getProfitLossReport });
  const reportData = data?.data ?? {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Profit and loss summary from the backend.</p>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading report...</p>}
      {isError && <p className="text-sm text-red-500">Unable to load reports.</p>}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="px-6 py-5 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Profit/Loss Summary</h2>
          </div>
          <div className="p-6">
            {Object.entries(reportData).length === 0 ? (
              <p className="text-sm text-gray-500">No report data available yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Object.entries(reportData).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border bg-gray-50 p-4">
                    <p className="text-sm uppercase tracking-wide text-gray-500">{key.replace(/_/g, " ")}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{typeof value === "number" ? `$${value.toLocaleString()}` : String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
