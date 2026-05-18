import type {
  FinanceCategory,
  FinanceCategoryType,
  FinanceTransaction,
  FinanceTransactionType,
} from "@/lib/finance/types";

/** First emoji/grapheme for category icon field. */
export function normalizeCategoryEmoji(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "📦";
  const parts = [...trimmed];
  return parts[0] ?? "📦";
}

export function computeCategoryUsageCounts(
  transactions: FinanceTransaction[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (!t.categoryId) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + 1);
  }
  return map;
}

export function sortCategoriesForPicker(
  categories: FinanceCategory[],
  type: FinanceTransactionType | "all",
  usageCounts: Map<string, number>,
): FinanceCategory[] {
  let list = categories;
  if (type !== "all") {
    list = categories.filter(
      (c) =>
        c.type === type ||
        c.type === "both" ||
        (type === "expense" && c.type === "expense") ||
        (type === "income" && c.type === "income"),
    );
  }
  return [...list].sort((a, b) => {
    const usageDiff = (usageCounts.get(b.id) ?? 0) - (usageCounts.get(a.id) ?? 0);
    if (usageDiff !== 0) return usageDiff;
    const orderDiff = a.order - b.order;
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });
}

export function categoryTypeLabel(type: FinanceCategoryType): string {
  if (type === "both") return "Both";
  return type === "income" ? "Income" : "Expense";
}
