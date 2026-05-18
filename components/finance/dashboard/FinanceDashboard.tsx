"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  PiggyBank,
  Repeat,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { BudgetProgressCard } from "@/components/finance/budget/BudgetProgressCard";
import { FinanceStatCard } from "@/components/finance/shared/FinanceStatCard";
import { MoneyDisplay } from "@/components/finance/shared/MoneyDisplay";
import { PeriodSelector } from "@/components/finance/shared/PeriodSelector";
import { TransactionList } from "@/components/finance/transactions/TransactionList";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/finance/format";
import { subscriptionMonthlyTotal } from "@/lib/finance/analytics";

export function FinanceDashboard() {
  const finance = useFinance();
  if (!finance) return null;

  const {
    dashboardStats,
    budgetUsage,
    subscriptions,
    transactions,
    currentPeriod,
    currentPeriodId,
  } = finance;

  const recent = transactions
    .filter((t) => !currentPeriodId || t.periodId === currentPeriodId)
    .slice(0, 8);

  const upcomingSubs = [...subscriptions]
    .filter((s) => s.active)
    .sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PeriodSelector />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceStatCard
          label="Income"
          value={<MoneyDisplay amount={dashboardStats.totalIncome} type="income" />}
          icon={ArrowUpRight}
          accent="emerald"
        />
        <FinanceStatCard
          label="Expenses"
          value={<MoneyDisplay amount={dashboardStats.totalExpense} type="expense" />}
          icon={ArrowDownRight}
          accent="rose"
        />
        <FinanceStatCard
          label="Balance"
          value={<MoneyDisplay amount={dashboardStats.balance} />}
          sub={`${dashboardStats.budgetUsedPercent.toFixed(0)}% of budget used`}
          icon={Wallet}
          accent="violet"
        />
        <FinanceStatCard
          label="Days left"
          value={dashboardStats.daysRemainingInPeriod}
          sub={`~${formatMoney(dashboardStats.dailyAverageSpending)}/day avg`}
          icon={Calendar}
          accent="amber"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <FinanceStatCard
          label="Subscriptions / mo"
          value={formatMoney(subscriptionMonthlyTotal(subscriptions))}
          icon={Repeat}
        />
        <FinanceStatCard
          label="Top spend"
          value={dashboardStats.largestExpenseCategory ?? "—"}
          icon={TrendingDown}
          accent="rose"
        />
        <FinanceStatCard
          label="Savings est."
          value={
            <MoneyDisplay
              amount={Math.max(0, dashboardStats.balance)}
              type={dashboardStats.balance >= 0 ? "income" : "expense"}
            />
          }
          icon={PiggyBank}
          accent="emerald"
        />
      </div>

      {budgetUsage.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Budget this period
            </h2>
            <Link
              href="/finance/budgets"
              className="text-xs text-violet-600 hover:underline dark:text-violet-400"
            >
              Manage
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {budgetUsage.slice(0, 4).map((u) => (
              <BudgetProgressCard key={u.categoryId} usage={u} />
            ))}
          </div>
        </section>
      ) : (
        <GlassCard padding="md" className="text-center text-sm text-zinc-500">
          No budget limits for {currentPeriod?.name ?? "this period"}.{" "}
          <Link href="/finance/budgets" className="text-violet-600 underline">
            Set limits
          </Link>
        </GlassCard>
      )}

      {upcomingSubs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Upcoming subscriptions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {upcomingSubs.map((s) => (
              <GlassCard key={s.id} padding="sm" className="flex justify-between">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-zinc-500">
                  {s.nextPaymentDate} · <MoneyDisplay amount={s.amount} />
                </span>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent transactions</h2>
          <Link
            href="/finance/transactions"
            className="text-xs text-violet-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <TransactionList items={recent} compact />
      </section>
    </div>
  );
}
