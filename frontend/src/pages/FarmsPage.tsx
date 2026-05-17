import { useQuery } from "@tanstack/react-query";
import { getFarms } from "@/api/farms";
import type { Farm } from "@/types";

export default function FarmsPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["farms"], queryFn: getFarms });
  const farms = data?.data.results ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Farms</h1>
          <p className="text-sm text-gray-500">Browse farms available to your account.</p>
        </div>
        <div className="text-sm text-gray-600">Total: {data?.data.count ?? 0}</div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading farms...</p>}
      {isError && <p className="text-sm text-red-500">Unable to load farms.</p>}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Province</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {farms.map((farm: Farm) => (
                <tr key={farm.id}>
                  <td className="px-4 py-4 text-sm text-gray-900">{farm.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{farm.province_name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{farm.location}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{farm.capacity}</td>
                  <td className={`px-4 py-4 text-sm font-medium ${farm.is_active ? "text-green-600" : "text-red-600"}`}>
                    {farm.is_active ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
