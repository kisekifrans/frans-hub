"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PeriodSelector } from "@/components/finance/shared/PeriodSelector";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import {
  dailySpendingSeries,
  spendingByCategory,
  sumByType,
} from "@/lib/finance/analytics";
import { formatMoney } from "@/lib/finance/format";

const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.9)",
};

export function FinanceAnalytics() {
  const finance = useFinance();
  if (!finance) return null;

  const {
    transactions,
    categories,
    currentPeriodId,
    budgetUsage,
    dashboardStats,
  } = finance;

  const periodTx = transactions.filter(
    (t) => !currentPeriodId || t.periodId === currentPeriodId,
  );
  const byCat = spendingByCategory(periodTx, categories);
  const daily = dailySpendingSeries(periodTx);
  const income = sumByType(periodTx, "income");
  const expense = sumByType(periodTx, "expense");

  const incomeVsExpense = [
    { name: "Income", value: income, fill: "#22c55e" },
    { name: "Expense", value: expense, fill: "#f43f5e" },
  ];

  const budgetChart = budgetUsage.map((u) => ({
    name: u.categoryName,
    spent: u.spent,
    limit: u.limitAmount,
  }));

  const wasteful = byCat[0];

  return (
    <div className="space-y-6">
      <PeriodSelector />

      <div className="grid gap-3 sm:grid-cols-3">
        <GlassCard padding="sm" className="text-sm">
          <p className="text-zinc-500">Most spent category</p>
          <p className="font-semibold">
            {wasteful ? `${wasteful.icon} ${wasteful.name}` : "—"}
          </p>
        </GlassCard>
        <GlassCard padding="sm" className="text-sm">
          <p className="text-zinc-500">Daily average</p>
          <p className="font-semibold">
            {formatMoney(dashboardStats.dailyAverageSpending)}
          </p>
        </GlassCard>
        <GlassCard padding="sm" className="text-sm">
          <p className="text-zinc-500">Days remaining</p>
          <p className="font-semibold">{dashboardStats.daysRemainingInPeriod}</p>
        </GlassCard>
      </div>

      <GlassCard padding="md">
        <h2 className="mb-4 text-sm font-semibold">Spending by category</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byCat}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {byCat.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatMoney(Number(v ?? 0))}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard padding="md">
        <h2 className="mb-4 text-sm font-semibold">Income vs expense</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpense}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                formatter={(v) => formatMoney(Number(v ?? 0))}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {incomeVsExpense.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {budgetChart.length > 0 && (
        <GlassCard padding="md">
          <h2 className="mb-4 text-sm font-semibold">Budget usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip
                  formatter={(v) => formatMoney(Number(v ?? 0))}
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Legend />
                <Bar dataKey="spent" fill="#8b5cf6" name="Spent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="limit" fill="#d4d4d8" name="Limit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      <GlassCard padding="md">
        <h2 className="mb-4 text-sm font-semibold">Daily spending</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 1e3).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => formatMoney(Number(v ?? 0))}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
