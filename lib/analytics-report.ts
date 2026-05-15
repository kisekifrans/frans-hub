import type {
  AnalyticsGranularity,
  AnalyticsPeriod,
  AnalyticsSeriesPoint,
  AnalyticsSnapshot,
  TopLinkStat,
} from "@/lib/types";

export interface AnalyticsEventRow {
  event_type: string;
  block_id: string | null;
  created_at: string;
  visitor_id?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
}

export function periodStart(period: AnalyticsPeriod): Date {
  const d = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function bucketKey(iso: string, granularity: AnalyticsGranularity): string {
  if (granularity === "weekly") return weekKey(iso);
  if (granularity === "monthly") return monthKey(iso);
  return dayKey(iso);
}

function formatLabel(key: string, granularity: AnalyticsGranularity): string {
  if (granularity === "monthly") {
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
  if (granularity === "weekly") {
    return key.slice(5);
  }
  return key.slice(5);
}

function enumerateBuckets(
  period: AnalyticsPeriod,
  granularity: AnalyticsGranularity,
): string[] {
  const start = periodStart(period);
  const end = new Date();
  const keys: string[] = [];
  const cursor = new Date(start);

  if (granularity === "monthly") {
    cursor.setUTCDate(1);
    while (cursor <= end) {
      keys.push(monthKey(cursor.toISOString()));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return keys;
  }

  if (granularity === "weekly") {
    const wk = weekKey(cursor.toISOString());
    const seen = new Set<string>();
    const c = new Date(start);
    while (c <= end) {
      const k = weekKey(c.toISOString());
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
      c.setUTCDate(c.getUTCDate() + 7);
    }
    if (!keys.includes(wk) && keys.length === 0) keys.push(wk);
    return keys.length ? keys : [wk];
  }

  while (cursor <= end) {
    keys.push(dayKey(cursor.toISOString()));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

export function buildAnalyticsReport(
  events: AnalyticsEventRow[],
  options: {
    period: AnalyticsPeriod;
    granularity: AnalyticsGranularity;
    blockTitles: Record<string, string>;
  },
): AnalyticsSnapshot {
  const { period, granularity, blockTitles } = options;
  const sinceMs = periodStart(period).getTime();

  const filtered = events.filter(
    (e) => new Date(e.created_at).getTime() >= sinceMs,
  );

  const viewsByBucket: Record<string, number> = {};
  const clicksByBucket: Record<string, number> = {};
  const clicksByBlock: Record<string, number> = {};
  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const visitors = new Set<string>();

  let totalViews = 0;
  let totalClicks = 0;
  let lastViewedAt: string | undefined;

  for (const e of filtered) {
    const bucket = bucketKey(e.created_at, granularity);

    if (e.event_type === "view") {
      totalViews++;
      viewsByBucket[bucket] = (viewsByBucket[bucket] ?? 0) + 1;
      if (e.visitor_id) visitors.add(e.visitor_id);
      if (!lastViewedAt || e.created_at > lastViewedAt) {
        lastViewedAt = e.created_at;
      }
    } else if (e.event_type === "click") {
      totalClicks++;
      clicksByBucket[bucket] = (clicksByBucket[bucket] ?? 0) + 1;
      if (e.block_id) {
        clicksByBlock[e.block_id] = (clicksByBlock[e.block_id] ?? 0) + 1;
      }
    }

    const device = e.device_type?.trim() || "unknown";
    devices[device] = (devices[device] ?? 0) + 1;

    const browser = e.browser?.trim() || "unknown";
    browsers[browser] = (browsers[browser] ?? 0) + 1;
  }

  const bucketKeys = enumerateBuckets(period, granularity);
  const extraKeys = new Set([
    ...Object.keys(viewsByBucket),
    ...Object.keys(clicksByBucket),
  ]);
  for (const k of extraKeys) {
    if (!bucketKeys.includes(k)) bucketKeys.push(k);
  }
  bucketKeys.sort();

  const series: AnalyticsSeriesPoint[] = bucketKeys.map((key) => ({
    key,
    label: formatLabel(key, granularity),
    views: viewsByBucket[key] ?? 0,
    clicks: clicksByBucket[key] ?? 0,
  }));

  const viewsByDay: Record<string, number> = {};
  const clicksByDay: Record<string, number> = {};
  for (const e of filtered) {
    const day = dayKey(e.created_at);
    if (e.event_type === "view") {
      viewsByDay[day] = (viewsByDay[day] ?? 0) + 1;
    } else if (e.event_type === "click") {
      clicksByDay[day] = (clicksByDay[day] ?? 0) + 1;
    }
  }

  const topLinks: TopLinkStat[] = Object.entries(clicksByBlock)
    .map(([blockId, clicks]) => ({
      blockId,
      title: blockTitles[blockId] ?? "Untitled link",
      clicks,
      share: totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return {
    period,
    granularity,
    totalViews,
    totalClicks,
    uniqueVisitors: visitors.size,
    series,
    topLinks,
    devices,
    browsers,
    viewsByDay,
    clicksByDay,
    clicksByBlock,
    lastViewedAt,
  };
}

export function emptyAnalytics(
  period: AnalyticsPeriod = "30d",
  granularity: AnalyticsGranularity = "daily",
): AnalyticsSnapshot {
  return buildAnalyticsReport([], {
    period,
    granularity,
    blockTitles: {},
  });
}
