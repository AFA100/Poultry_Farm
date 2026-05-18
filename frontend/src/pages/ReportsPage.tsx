import { useQuery } from "@tanstack/react-query";
import { getProfitLossReport } from "@/api/reports";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const CHART_COLORS = ["hsl(33,85%,45%)", "hsl(20,72%,52%)", "hsl(43,90%,55%)", "hsl(15,60%,40%)", "hsl(50,80%,60%)"];

export default function ReportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profit-loss-report"],
    queryFn: () => getProfitLossReport(),
  });

  const reportData = (data?.data ?? {}) as Record<string, unknown>;

  // Build chart data from numeric fields
  const chartData = Object.entries(reportData)
    .filter(([, v]) => typeof v === "number")
    .map(([key, value]) => ({
      name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: value as number,
    }));

  // Separate stat cards (top-level numbers)
  const statEntries = Object.entries(reportData).filter(([, v]) => typeof v === "number");

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" description="Profit & loss summary across all farms." />

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="skeleton h-3 w-24 rounded mb-3" />
              <div className="skeleton h-8 w-32 rounded" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Unable to load reports. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Stat cards */}
          {statEntries.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {statEntries.map(([key, value], i) => (
                <StatsCard
                  key={key}
                  title={key.replace(/_/g, " ")}
                  value={typeof value === "number" && key.toLowerCase().includes("profit") || key.toLowerCase().includes("income") || key.toLowerCase().includes("expense") || key.toLowerCase().includes("capital")
                    ? `$${(value as number).toLocaleString()}`
                    : String(value)}
                  variant={["default", "accent", "info", "warning"][i % 4] as "default" | "accent" | "info" | "warning"}
                />
              ))}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Profit / Loss Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {statEntries.length === 0 && chartData.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No report data available yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
