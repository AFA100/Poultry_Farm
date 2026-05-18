import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProvinceDashboard } from "@/hooks/useDashboard";
import { getProvinces } from "@/api/provinces";
import { getFarms } from "@/api/farms";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { Farm, Province } from "@/types";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-32 rounded" />
    </div>
  );
}

export default function ProvinceDashboardPage() {
  const { provinceId } = useParams<{ provinceId: string }>();
  const navigate = useNavigate();

  const { data: dashData, isLoading: dashLoading } = useProvinceDashboard(provinceId ?? "");

  const { data: provData } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => getProvinces({ page_size: "200" }),
  });

  const { data: farmsData, isLoading: farmsLoading } = useQuery({
    queryKey: ["farms"],
    queryFn: () => getFarms({ page_size: "200" }),
  });

  const province = provData?.data.results.find((p: Province) => p.id === provinceId);
  const provinceFarms = (farmsData?.data.results ?? []).filter(
    (f: Farm) => f.province === provinceId
  );

  const d = dashData?.data;

  const financeChartData = d
    ? [
        { name: "Income", value: d.total_income, fill: "hsl(33,85%,45%)" },
        { name: "Expenses", value: d.total_expenses, fill: "hsl(20,72%,52%)" },
        { name: "Net Profit", value: Math.max(0, d.net_profit), fill: "hsl(43,90%,55%)" },
      ]
    : [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={province ? `${province.name} — Dashboard` : "Province Dashboard"}
        description="Live metrics scoped to this province."
      >
        <Button variant="outline" size="sm" onClick={() => navigate("/provinces")}>
          ← All Provinces
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          System Dashboard
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {dashLoading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : d
          ? (
            <>
              <StatsCard title="Farms" value={d.total_farms} variant="default"
                icon={() => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
              />
              <StatsCard title="Employees" value={d.total_employees} variant="accent"
                icon={() => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
              <StatsCard title="Live Chickens" value={d.total_chickens.toLocaleString()} variant="info" />
              <StatsCard title="Feed Stock" value={`${d.total_feed_remaining.toLocaleString()} kg`} variant="warning" />
              <StatsCard title="Total Income" value={`$${d.total_income.toLocaleString()}`} variant="default" />
              <StatsCard title="Total Expenses" value={`$${d.total_expenses.toLocaleString()}`} variant="accent" />
              <StatsCard
                title="Net Profit"
                value={`$${d.net_profit.toLocaleString()}`}
                variant={d.net_profit >= 0 ? "default" : "warning"}
                subtitle={d.net_profit >= 0 ? "Profitable" : "Loss"}
              />
            </>
          )
          : null}
      </div>

      {/* Chart + Farms list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {d ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={financeChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {financeChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="skeleton h-[220px] rounded-lg" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Farms in this Province</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {farmsLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 rounded-lg" />
                ))}
              </div>
            ) : provinceFarms.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted-foreground text-center">No farms in this province.</p>
            ) : (
              <div className="divide-y divide-border">
                {provinceFarms.map((farm: Farm) => (
                  <div key={farm.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{farm.name}</p>
                      <p className="text-xs text-muted-foreground">{farm.location || "No location"} · Capacity: {farm.capacity.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={farm.is_active ? "active" : "inactive"} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
