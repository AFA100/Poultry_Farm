import { useGlobalDashboard } from "@/hooks/useDashboard";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({ label, value, color = "text-gray-900" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useGlobalDashboard();

  if (isLoading) return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  if (isError || !data) return <p className="text-sm text-red-500">Failed to load dashboard.</p>;

  const d = data.data;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-800 mb-6">Global Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Provinces" value={d.total_provinces} />
        <StatCard label="Active Farms" value={d.total_farms} />
        <StatCard label="Active Employees" value={d.total_employees} />
        <StatCard label="Live Chickens" value={d.total_chickens.toLocaleString()} />
        <StatCard label="Feed Remaining" value={`${d.total_feed_remaining.toLocaleString()} units`} />
        <StatCard label="Total Income" value={`$${d.total_income.toLocaleString()}`} color="text-green-600" />
        <StatCard label="Total Expenses" value={`$${d.total_expenses.toLocaleString()}`} color="text-red-500" />
        <StatCard
          label="Net Profit"
          value={`$${d.net_profit.toLocaleString()}`}
          color={d.net_profit >= 0 ? "text-green-600" : "text-red-500"}
        />
      </div>
    </div>
  );
}
