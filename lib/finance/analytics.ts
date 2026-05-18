import type {
  FinanceDashboardStats,
  FinanceFilters,
  FinanceSubscription,
  FinanceTransaction,
  FinanceBudgetLimit,
} from "@/lib/finance/types";
import { computeBudgetUsage } from "@/lib/finance/budget";
import type { FinanceCategory, FinanceBudgetPeriod } from "@/lib/finance/types";
import { daysRemainingInPeriod } from "@/lib/finance/periods";
import { toISODate } from "@/lib/finance/format";

export function filterTransactions(
  transactions: FinanceTransaction[],
  filters: FinanceFilters,
): FinanceTransaction[] {
  let list = [...transactions];

  if (filters.type && filters.type !== "all") {
    list = list.filter((t) => t.type === filters.type);
  }
  if (filters.categoryId) {
    list = list.filter((t) => t.categoryId === filters.categoryId);
  }
  if (filters.paymentMethodId) {
    list = list.filter((t) => t.paymentMethodId === filters.paymentMethodId);
  }
  if (filters.periodId) {
    list = list.filter((t) => t.periodId === filters.periodId);
  }
  if (filters.dateFrom) {
    list = list.filter((t) => t.transactionDate >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    list = list.filter((t) => t.transactionDate <= filters.dateTo!);
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  return list.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
}

export function resolveDateRange(
  filters: FinanceFilters,
  periods: FinanceBudgetPeriod[],
): { from?: string; to?: string } {
  const today = toISODate();
  switch (filters.preset) {
    case "today":
      return { from: today, to: today };
    case "week": {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return { from: toISODate(d), to: today };
    }
    case "month": {
      const d = new Date();
      return {
        from: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
        to: today,
      };
    }
    case "period": {
      const p = periods.find((x) => x.id === filters.periodId);
      if (p) return { from: p.startDate, to: p.endDate };
      return {};
    }
    case "custom":
      return { from: filters.dateFrom, to: filters.dateTo };
    default:
      return {};
  }
}

export function sumByType(
  transactions: FinanceTransaction[],
  type: "income" | "expense",
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((s, t) => s + t.amount, 0);
}

export function spendingByCategory(
  transactions: FinanceTransaction[],
  categories: FinanceCategory[],
): { name: string; value: number; color: string; icon: string }[] {
  const map = new Map<string, number>();
  for (const t of transactions.filter((x) => x.type === "expense")) {
    const key = t.categoryId ?? "other";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([id, value]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        name: cat?.name ?? "Other",
        value,
        color: cat?.color ?? "#71717a",
        icon: cat?.icon ?? "📦",
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function subscriptionMonthlyTotal(
  subs: FinanceSubscription[],
): number {
  return subs
    .filter((s) => s.active)
    .reduce((sum, s) => {
      if (s.billingCycle === "weekly") return sum + s.amount * 4.33;
      if (s.billingCycle === "yearly") return sum + s.amount / 12;
      return sum + s.amount;
    }, 0);
}

export function computeDashboardStats(
  transactions: FinanceTransaction[],
  limits: FinanceBudgetLimit[],
  categories: FinanceCategory[],
  period: FinanceBudgetPeriod | undefined,
  subscriptions: FinanceSubscription[],
): FinanceDashboardStats {
  const periodTx = period
    ? transactions.filter((t) => t.periodId === period.id)
    : transactions;

  const totalIncome = sumByType(periodTx, "income");
  const totalExpense = sumByType(periodTx, "expense");
  const usage = period
    ? computeBudgetUsage(limits, categories, transactions, period.id)
    : [];
  const totalLimit = usage.reduce((s, u) => s + u.limitAmount, 0);
  const totalSpent = usage.reduce((s, u) => s + u.spent, 0);
  const budgetUsedPercent =
    totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  const byCat = spendingByCategory(periodTx, categories);
  const daysRemaining = period
    ? daysRemainingInPeriod(period)
    : 0;
  const periodDays = period
    ? Math.max(
        1,
        Math.ceil(
          (new Date(period.endDate).getTime() -
            new Date(period.startDate).getTime()) /
            86_400_000,
        ) + 1,
      )
    : 30;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    budgetUsedPercent,
    subscriptionMonthlyTotal: subscriptionMonthlyTotal(subscriptions),
    largestExpenseCategory: byCat[0]?.name ?? null,
    daysRemainingInPeriod: daysRemaining,
    dailyAverageSpending: totalExpense / periodDays,
  };
}

export function dailySpendingSeries(
  transactions: FinanceTransaction[],
): { date: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions.filter((x) => x.type === "expense")) {
    map.set(
      t.transactionDate,
      (map.get(t.transactionDate) ?? 0) + t.amount,
    );
  }
  return [...map.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
