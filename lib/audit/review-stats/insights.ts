import { formatDisplayDate } from "./date-detect";
import { formatSecondsToPace } from "./pace";
import type { DailyStats, TimelineEvent, TimelineEventType } from "./types";

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function eventTypeLabel(type: TimelineEventType): string {
  const labels: Record<TimelineEventType, string> = {
    bug: "Bug / Issue",
    priority_change: "Priority Change",
    training: "Training Session",
    downtime: "System Downtime",
    policy_update: "Policy Update",
    other: "Other",
  };
  return labels[type];
}

export function generateDailyInsights(
  dailyStats: DailyStats[],
  allEvents: TimelineEvent[],
): string[] {
  if (dailyStats.length === 0) return [];

  const insights: string[] = [];
  const maxReviews = dailyStats.reduce((best, d) =>
    d.totalReviews > best.totalReviews ? d : best,
  );
  insights.push(
    `${formatDisplayDate(maxReviews.date)} had the highest total reviews (${maxReviews.totalReviews}).`,
  );

  for (let i = 1; i < dailyStats.length; i++) {
    const prev = dailyStats[i - 1];
    const curr = dailyStats[i];
    const change = pctChange(curr.totalReviews, prev.totalReviews);
    if (change != null && change <= -10) {
      const nearbyEvents = allEvents.filter(
        (e) => e.date === prev.date || e.date === curr.date,
      );
      const eventHint =
        nearbyEvents.length > 0
          ? ` May be related to timeline notes on ${[...new Set(nearbyEvents.map((e) => formatDisplayDate(e.date)))].join(", ")}.`
          : "";
      insights.push(
        `Total reviews dropped by ${Math.abs(Math.round(change))}% after ${formatDisplayDate(prev.date)} (compared with previous dated upload).${eventHint}`,
      );
    }
    if (change != null && change >= 15) {
      insights.push(
        `Total reviews increased by ${Math.round(change)}% on ${formatDisplayDate(curr.date)} (compared with previous dated upload).`,
      );
    }
  }

  const bugDates = new Set(
    allEvents.filter((e) => e.type === "bug").map((e) => e.date),
  );
  const bugDays = dailyStats.filter((d) => bugDates.has(d.date));
  if (bugDays.length >= 1) {
    const bugPaces = bugDays
      .map((d) => d.averageMedianPaceSeconds)
      .filter((v): v is number => v != null);
    const avgPace =
      bugPaces.length > 0
        ? bugPaces.reduce((a, b) => a + b, 0) / bugPaces.length
        : 0;
    const otherDays = dailyStats.filter((d) => !bugDates.has(d.date));
    const otherAvg =
      otherDays
        .map((d) => d.averageMedianPaceSeconds)
        .filter((v): v is number => v != null);
    if (otherAvg.length > 0 && avgPace > 0) {
      const otherMean = otherAvg.reduce((a, b) => a + b, 0) / otherAvg.length;
      if (avgPace > otherMean * 1.05) {
        insights.push(
          `Average median pace was slower on days with Bug / Issue notes (possible impact: ~${formatSecondsToPace(avgPace)} vs ~${formatSecondsToPace(otherMean)}).`,
        );
      }
    }
  }

  const priorityEvents = allEvents.filter((e) => e.type === "priority_change");
  if (priorityEvents.length > 0 && dailyStats.length >= 2) {
    const firstPriority = [...priorityEvents].sort((a, b) =>
      a.date.localeCompare(b.date),
    )[0];
    const before = dailyStats.filter((d) => d.date < firstPriority.date);
    const after = dailyStats.filter((d) => d.date >= firstPriority.date);
    if (before.length > 0 && after.length > 0) {
      const avgBefore =
        before.reduce((s, d) => s + d.belowThresholdCount, 0) / before.length;
      const avgAfter =
        after.reduce((s, d) => s + d.belowThresholdCount, 0) / after.length;
      if (avgAfter > avgBefore * 1.1) {
        insights.push(
          `Below-threshold reviewers may have increased after the priority change on ${formatDisplayDate(firstPriority.date)} (possible impact).`,
        );
      }
    }
  }

  for (const event of allEvents) {
    const day = dailyStats.find((d) => d.date === event.date);
    if (!day) continue;
    const idx = dailyStats.findIndex((d) => d.date === event.date);
    if (idx <= 0) continue;
    const prev = dailyStats[idx - 1];
    const paceChange = pctChange(
      day.averageMedianPaceSeconds ?? 0,
      prev.averageMedianPaceSeconds ?? 0,
    );
    if (
      event.type === "training" &&
      paceChange != null &&
      Math.abs(paceChange) >= 8
    ) {
      insights.push(
        `${eventTypeLabel(event.type)} on ${formatDisplayDate(event.date)} ("${event.title}") may be related to a median pace shift vs the previous dated upload.`,
      );
      break;
    }
  }

  return [...new Set(insights)].slice(0, 6);
}
