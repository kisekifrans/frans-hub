import type { EdgeCase, EdgeCaseFilters } from "@/lib/edgecases/types";

export function filterEdgeCases(
  items: EdgeCase[],
  filters: EdgeCaseFilters,
): EdgeCase[] {
  const q = filters.search.trim().toLowerCase();
  const now = Date.now();
  const cutoff =
    filters.datePreset === "7d"
      ? now - 7 * 86_400_000
      : filters.datePreset === "30d"
        ? now - 30 * 86_400_000
        : 0;

  return items.filter((item) => {
    if (filters.favoritesOnly && !item.isFavorite) return false;
    if (filters.decision !== "all" && item.decision !== filters.decision) {
      return false;
    }
    if (
      filters.project !== "all" &&
      (item.projectName ?? "") !== filters.project
    ) {
      return false;
    }
    if (cutoff > 0 && new Date(item.createdAt).getTime() < cutoff) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      item.title,
      item.description,
      item.rejectReason ?? "",
      item.projectName ?? "",
      item.taskDescription ?? "",
      item.taskId ?? "",
      item.episodeId ?? "",
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function uniqueProjects(items: EdgeCase[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const p = item.projectName?.trim();
    if (p) set.add(p);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
