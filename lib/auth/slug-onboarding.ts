/** User must pick a public username before member areas (finance, dashboard). */
export function needsSlugOnboarding(
  slug: string,
  slugChangedAt: string | null | undefined,
): boolean {
  if (slugChangedAt) return false;
  if (slug === "main") return false;
  return true;
}
