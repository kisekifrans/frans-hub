import type { AnalyticsGranularity } from "@/lib/types";

const CHART_LOCALE = "en-US";

/** Parse YYYY-MM-DD bucket keys in local time (avoids UTC day shifts). */
export function parseBucketDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m) {
    return new Date(key);
  }
  if (d) {
    return new Date(y, m - 1, d);
  }
  return new Date(y, m - 1, 1);
}

export function formatChartBucketLabel(
  key: string,
  granularity: AnalyticsGranularity,
): string {
  const date = parseBucketDate(key);

  if (granularity === "monthly") {
    return date.toLocaleDateString(CHART_LOCALE, {
      month: "short",
      year: "2-digit",
    });
  }

  if (granularity === "weekly") {
    return date.toLocaleDateString(CHART_LOCALE, {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString(CHART_LOCALE, {
    month: "short",
    day: "numeric",
  });
}

/** Pick axis label indices so labels stay readable and non-repeating. */
export function chartLabelIndices(
  count: number,
  maxLabels = 7,
): Set<number> {
  if (count <= 0) return new Set();
  if (count <= maxLabels) {
    return new Set(Array.from({ length: count }, (_, i) => i));
  }

  const indices = new Set<number>([0, count - 1]);
  const innerSlots = maxLabels - 2;
  const step = (count - 1) / (innerSlots + 1);

  for (let i = 1; i <= innerSlots; i++) {
    indices.add(Math.round(i * step));
  }

  return indices;
}
