import type { AnalyticsSnapshot } from "./types";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function recordView(analytics: AnalyticsSnapshot): AnalyticsSnapshot {
  const day = todayKey();
  return {
    ...analytics,
    totalViews: analytics.totalViews + 1,
    viewsByDay: {
      ...analytics.viewsByDay,
      [day]: (analytics.viewsByDay[day] ?? 0) + 1,
    },
    lastViewedAt: new Date().toISOString(),
  };
}

export function recordClick(
  analytics: AnalyticsSnapshot,
  blockId: string,
): AnalyticsSnapshot {
  const day = todayKey();
  return {
    ...analytics,
    totalClicks: analytics.totalClicks + 1,
    clicksByBlock: {
      ...analytics.clicksByBlock,
      [blockId]: (analytics.clicksByBlock[blockId] ?? 0) + 1,
    },
    clicksByDay: {
      ...analytics.clicksByDay,
      [day]: (analytics.clicksByDay[day] ?? 0) + 1,
    },
  };
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function ctr(analytics: AnalyticsSnapshot): number {
  if (analytics.totalViews === 0) return 0;
  return Math.round((analytics.totalClicks / analytics.totalViews) * 1000) / 10;
}
