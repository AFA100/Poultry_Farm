import { useQuery } from "@tanstack/react-query";
import { getProvinces } from "@/api/provinces";
import type { Province } from "@/types";

export default function ProvincesPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["provinces"], queryFn: getProvinces });
  const provinces = data?.data.results ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Provinces</h1>
          <p className="text-sm text-gray-500">All provinces visible to your account.</p>
        </div>
        <div className="text-sm text-gray-600">Total: {data?.data.count ?? 0}</div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading provinces...</p>}
      {isError && <p className="text-sm text-red-500">Unable to load provinces.</p>}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farms</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {provinces.map((province: Province) => (
                <tr key={province.id}>
                  <td className="px-4 py-4 text-sm text-gray-900">{province.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{province.farm_count}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{new Date(province.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
