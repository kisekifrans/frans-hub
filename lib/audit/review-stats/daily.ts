import { mergeCsvBundles, type CsvBundle } from "@/lib/audit/csv-bundles";
import { buildOutreachRecords } from "@/lib/audit/outreach/parse";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import { filterByReviewsBelow } from "./compute";
import {
  excludeEmailsFromRecords,
  includeOnlyEmailsFromRecords,
} from "./filter";
import { parseHoursToNumber } from "./hours";
import { parseMedianPaceToSeconds } from "./pace";
import type { CsvSourceType, DailyStats, TimelineEvent } from "./types";

export interface DailyAggregationOptions {
  columnMap: OutreachColumnMap;
  ignoreZeroReviews: boolean;
  reviewsBelowThreshold: number;
  excludeEmails: string[];
  includeEmails: string[];
  includeListActive: boolean;
  sourceTypeFilter: CsvSourceType | "all";
  events: TimelineEvent[];
}

function paceStats(values: string[]) {
  const seconds = values
    .map(parseMedianPaceToSeconds)
    .filter((v): v is number => v != null);
  if (seconds.length === 0) {
    return {
      averageMedianPaceSeconds: undefined,
      highestMedianPaceSeconds: undefined,
      lowestMedianPaceSeconds: undefined,
    };
  }
  const sum = seconds.reduce((a, b) => a + b, 0);
  return {
    averageMedianPaceSeconds: sum / seconds.length,
    highestMedianPaceSeconds: Math.max(...seconds),
    lowestMedianPaceSeconds: Math.min(...seconds),
  };
}

function hoursStats(values: string[]) {
  const nums = values
    .map(parseHoursToNumber)
    .filter((v): v is number => v != null);
  if (nums.length === 0) {
    return { totalHours: undefined, averageHours: undefined };
  }
  const total = nums.reduce((a, b) => a + b, 0);
  return { totalHours: total, averageHours: total / nums.length };
}

function aggregateDay(
  date: string,
  bundles: CsvBundle[],
  opts: DailyAggregationOptions,
): DailyStats {
  const merged = mergeCsvBundles(bundles);
  let records = buildOutreachRecords(merged.rows, opts.columnMap);
  records = excludeEmailsFromRecords(records, opts.excludeEmails);
  if (opts.includeListActive) {
    records = includeOnlyEmailsFromRecords(records, opts.includeEmails);
  }

  const zeroReviewCount = records.filter((r) => r.reviews === 0).length;
  const active = opts.ignoreZeroReviews
    ? records.filter((r) => r.reviews > 0)
    : records;

  const belowThresholdCount = filterByReviewsBelow(
    records,
    opts.reviewsBelowThreshold,
    { ignoreZeroReviews: opts.ignoreZeroReviews },
  ).length;

  const totalReviews = active.reduce((sum, r) => sum + r.reviews, 0);
  const pace = paceStats(active.map((r) => r.medianPace));
  const hours = hoursStats(active.map((r) => r.hours));
  const dayEvents = opts.events.filter((e) => e.date === date);

  return {
    date,
    totalReviews,
    averageReviews:
      active.length > 0
        ? Math.round((totalReviews / active.length) * 100) / 100
        : 0,
    ...pace,
    ...hours,
    uniqueEmails: records.length,
    belowThresholdCount,
    zeroReviewCount,
    events: dayEvents,
  };
}

/** Build one daily point per report date from dated CSV bundles. */
export function computeDailyStats(
  bundles: CsvBundle[],
  opts: DailyAggregationOptions,
): DailyStats[] {
  let dated = bundles.filter((b) => b.reportDate?.trim());

  if (opts.sourceTypeFilter !== "all") {
    dated = dated.filter(
      (b) => (b.sourceType ?? "Other") === opts.sourceTypeFilter,
    );
  }

  const byDate = new Map<string, CsvBundle[]>();
  for (const bundle of dated) {
    const date = bundle.reportDate!.trim();
    const list = byDate.get(date) ?? [];
    list.push(bundle);
    byDate.set(date, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayBundles]) => aggregateDay(date, dayBundles, opts));
}

export function filterDailyStatsByRange(
  stats: DailyStats[],
  startDate?: string,
  endDate?: string,
): DailyStats[] {
  return stats.filter((d) => {
    if (startDate && d.date < startDate) return false;
    if (endDate && d.date > endDate) return false;
    return true;
  });
}
