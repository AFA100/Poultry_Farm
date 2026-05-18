import { useGlobalDashboard } from "@/hooks/useDashboard";
import StatsCard from "@/components/StatsCard";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(33,85%,45%)", "hsl(20,72%,52%)", "hsl(43,90%,55%)",
  "hsl(15,60%,40%)", "hsl(50,80%,60%)",
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-32 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useGlobalDashboard();

  const d = data?.data;

  const financeBarData = d
    ? [
        { name: "Income", value: d.total_income, fill: "hsl(33,85%,45%)" },
        { name: "Expenses", value: d.total_expenses, fill: "hsl(20,72%,52%)" },
        { name: "Capital", value: d.total_capital, fill: "hsl(43,90%,55%)" },
      ]
    : [];

  const overviewPieData = d
    ? [
        { name: "Farms", value: d.total_farms },
        { name: "Employees", value: d.total_employees },
        { name: "Chickens", value: d.total_chickens },
      ].filter((x) => x.value > 0)
    : [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="System Dashboard"
        description="Live overview of the entire Poultry ERP system."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
        ) : d ? (
          <>
            <StatsCard title="Provinces" value={d.total_provinces} variant="default"
              icon={() => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
            />
            <StatsCard title="Active Farms" value={d.total_farms} variant="accent"
              icon={() => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
            />
            <StatsCard title="Employees" value={d.total_employees} variant="info"
              icon={() => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatsCard title="Live Chickens" value={d.total_chickens.toLocaleString()} variant="warning"
              icon={() => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            />
            <StatsCard title="Feed Stock" value={`${d.total_feed_remaining.toLocaleString()} kg`} variant="default" />
            <StatsCard title="Total Income" value={`$${d.total_income.toLocaleString()}`} variant="default" />
            <StatsCard title="Total Expenses" value={`$${d.total_expenses.toLocaleString()}`} variant="accent" />
            <StatsCard title="Total Capital" value={`$${d.total_capital.toLocaleString()}`} variant="info" />
            <StatsCard
              title="Net Profit"
              value={`$${d.net_profit.toLocaleString()}`}
              variant={d.net_profit >= 0 ? "default" : "warning"}
              subtitle={d.net_profit >= 0 ? "Profitable" : "Loss"}
            />
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={financeBarData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {financeBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={overviewPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {overviewPieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
