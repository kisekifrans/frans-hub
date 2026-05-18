import type {
  FinanceCategory,
  FinancePaymentMethod,
} from "@/lib/finance/types";

/** Keep first occurrence per profile + normalized name + type. */
export function dedupeCategories(categories: FinanceCategory[]): FinanceCategory[] {
  const seen = new Map<string, FinanceCategory>();
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  for (const c of sorted) {
    const key = `${c.name.trim().toLowerCase()}\0${c.type}`;
    if (!seen.has(key)) seen.set(key, c);
  }
  return [...seen.values()];
}

export function dedupePaymentMethods(
  methods: FinancePaymentMethod[],
): FinancePaymentMethod[] {
  const seen = new Map<string, FinancePaymentMethod>();
  const sorted = [...methods].sort((a, b) => a.order - b.order);
  for (const m of sorted) {
    const key = m.name.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, m);
  }
  return [...seen.values()];
}

export function findBudgetLimitForCategory(
  limits: { id: string; periodId: string; categoryId: string }[],
  periodId: string,
  categoryId: string,
): { id: string } | undefined {
  return limits.find(
    (l) => l.periodId === periodId && l.categoryId === categoryId,
  );
}
