export const DEFAULT_CATEGORIES = [
  "Payment",
  "Thank You",
  "Warning",
  "Steam",
  "Growtopia",
  "Facebook",
  "Confirmation",
  "Banking",
  "Promo",
] as const;

export function mergeCategories(
  defaults: readonly string[],
  custom: string[],
  snippets: { category: string }[],
): string[] {
  const set = new Set<string>();
  for (const c of defaults) set.add(c);
  for (const c of custom) if (c.trim()) set.add(c.trim());
  for (const s of snippets) if (s.category.trim()) set.add(s.category.trim());
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
