import type {
  BudgetUsage,
  FinanceBudgetLimit,
  FinanceCategory,
  FinanceTransaction,
} from "@/lib/finance/types";

export function computeBudgetUsage(
  limits: FinanceBudgetLimit[],
  categories: FinanceCategory[],
  transactions: FinanceTransaction[],
  periodId: string,
): BudgetUsage[] {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const expenses = transactions.filter(
    (t) => t.type === "expense" && t.periodId === periodId,
  );

  return limits
    .filter((l) => l.periodId === periodId)
    .map((limit) => {
      const cat = catMap.get(limit.categoryId);
      const spent = expenses
        .filter((t) => t.categoryId === limit.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const remaining = Math.max(0, limit.limitAmount - spent);
      const percent =
        limit.limitAmount > 0
          ? Math.min(100, (spent / limit.limitAmount) * 100)
          : spent > 0
            ? 100
            : 0;

      let status: BudgetUsage["status"] = "ok";
      if (percent >= 100) status = "over";
      else if (percent >= limit.warningThreshold) status = "warning";

      return {
        categoryId: limit.categoryId,
        categoryName: cat?.name ?? "Unknown",
        icon: cat?.icon ?? "📦",
        color: cat?.color ?? "#8b5cf6",
        limitAmount: limit.limitAmount,
        spent,
        remaining,
        percent,
        warningThreshold: limit.warningThreshold,
        status,
      };
    })
    .sort((a, b) => b.spent - a.spent);
}
