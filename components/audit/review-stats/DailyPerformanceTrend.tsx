"use client";

import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { useClientMounted } from "@/hooks/useClientMounted";
import { formatDisplayDate } from "@/lib/audit/review-stats/date-detect";
import type { CsvBundle } from "@/lib/audit/csv-bundles";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import { computeDailyStats } from "@/lib/audit/review-stats/daily";
import { downloadDailyStatsCsv } from "@/lib/audit/review-stats/export-daily";
import { generateDailyInsights } from "@/lib/audit/review-stats/insights";
import { formatSecondsToPace } from "@/lib/audit/review-stats/pace";
import {
  DEFAULT_TREND_METRICS,
  PACE_METRICS,
  TREND_METRIC_LABELS,
  TIMELINE_EVENT_LABELS,
  type CsvSourceType,
  type DailyStats,
  type TimelineEvent,
  type TrendMetricKey,
} from "@/lib/audit/review-stats/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const inputClass =
  "glass-card rounded-lg border-0 px-2 py-1.5 text-xs text-zinc-800 dark:text-zinc-100";

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

const METRIC_COLORS: Record<TrendMetricKey, string> = {
  totalReviews: "#8b5cf6",
  averageReviews: "#a78bfa",
  averageMedianPace: "#10b981",
  totalHours: "#f59e0b",
  averageHours: "#fbbf24",
  uniqueEmails: "#ec4899",
  belowThresholdCount: "#f43f5e",
  zeroReviewCount: "#94a3b8",
};

const ALL_METRICS = Object.keys(TREND_METRIC_LABELS) as TrendMetricKey[];

const SOURCE_FILTERS: Array<CsvSourceType | "all"> = [
  "all",
  "Reviewer",
  "Auditor",
  "Mixed",
  "Other",
];

interface ChartPoint {
  date: string;
  label: string;
  events: TimelineEvent[];
  eventMarker: number;
  [key: string]: string | number | TimelineEvent[];
}

function metricValue(day: DailyStats, key: TrendMetricKey): number | undefined {
  switch (key) {
    case "totalReviews":
      return day.totalReviews;
    case "averageReviews":
      return day.averageReviews;
    case "averageMedianPace":
      return day.averageMedianPaceSeconds;
    case "totalHours":
      return day.totalHours;
    case "averageHours":
      return day.averageHours;
    case "uniqueEmails":
      return day.uniqueEmails;
    case "belowThresholdCount":
      return day.belowThresholdCount;
    case "zeroReviewCount":
      return day.zeroReviewCount;
    default:
      return undefined;
  }
}

function formatMetricValue(key: TrendMetricKey, value: number): string {
  if (key === "averageMedianPace") return formatSecondsToPace(value);
  if (key === "totalHours" || key === "averageHours") {
    return `${Math.round(value * 10) / 10}h`;
  }
  if (key === "averageReviews") return String(Math.round(value * 100) / 100);
  return String(Math.round(value * 10) / 10);
}

interface DailyPerformanceTrendProps {
  csvBundles: CsvBundle[];
  columnMap: OutreachColumnMap;
  ignoreZeroReviews: boolean;
  reviewsBelowThreshold: number;
  excludeEmails: string[];
  includeEmails: string[];
  includeListActive: boolean;
  allEvents: TimelineEvent[];
  undatedFileCount: number;
}

export function DailyPerformanceTrend({
  csvBundles,
  columnMap,
  ignoreZeroReviews,
  reviewsBelowThreshold,
  excludeEmails,
  includeEmails,
  includeListActive,
  allEvents,
  undatedFileCount,
}: DailyPerformanceTrendProps) {
  const mounted = useClientMounted();
  const [selectedMetrics, setSelectedMetrics] =
    useState<TrendMetricKey[]>(DEFAULT_TREND_METRICS);
  const [sourceFilter, setSourceFilter] = useState<CsvSourceType | "all">(
    "all",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showEventMarkers, setShowEventMarkers] = useState(true);

  const dailyStats = useMemo(
    () =>
      computeDailyStats(csvBundles, {
        columnMap,
        ignoreZeroReviews,
        reviewsBelowThreshold,
        excludeEmails,
        includeEmails,
        includeListActive,
        sourceTypeFilter: sourceFilter,
        events: allEvents,
      }),
    [
      csvBundles,
      columnMap,
      ignoreZeroReviews,
      reviewsBelowThreshold,
      excludeEmails,
      includeEmails,
      includeListActive,
      sourceFilter,
      allEvents,
    ],
  );

  const filteredStats = useMemo(() => {
    return dailyStats.filter((d) => {
      if (startDate && d.date < startDate) return false;
      if (endDate && d.date > endDate) return false;
      return true;
    });
  }, [dailyStats, startDate, endDate]);

  const chartData = useMemo((): ChartPoint[] => {
    return filteredStats.map((day) => {
      const point: ChartPoint = {
        date: day.date,
        label: formatDisplayDate(day.date),
        events: day.events,
        eventMarker: day.events.length > 0 ? 1 : 0,
      };
      for (const key of ALL_METRICS) {
        const v = metricValue(day, key);
        if (v != null) point[key] = v;
      }
      if (day.events.length > 0) {
        const firstMetric = selectedMetrics.find(
          (m) => metricValue(day, m) != null,
        );
        if (firstMetric) {
          point.eventY = metricValue(day, firstMetric) as number;
        }
      }
      return point;
    });
  }, [filteredStats, selectedMetrics]);

  const insights = useMemo(
    () => generateDailyInsights(filteredStats, allEvents),
    [filteredStats, allEvents],
  );

  const paceSelected = selectedMetrics.some((m) => PACE_METRICS.has(m));
  const countSelected = selectedMetrics.some((m) => !PACE_METRICS.has(m));

  const toggleMetric = (key: TrendMetricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const copyInsights = async () => {
    if (insights.length === 0) {
      toast.error("No insights to copy");
      return;
    }
    await navigator.clipboard.writeText(insights.join("\n"));
    toast.success("Copied insights");
  };

  const emptyMessage =
    csvBundles.length === 0
      ? "Upload CSV files to begin."
      : "Assign report dates to uploaded files to see daily trends.";

  return (
    <div className="space-y-4">
      <GlassCard padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Daily Performance Trend
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Compare metrics across report dates. Filters above apply to this
              chart.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnClass}
              disabled={filteredStats.length === 0}
              onClick={() => downloadDailyStatsCsv(filteredStats)}
            >
              <Download className="h-3.5 w-3.5" />
              Export daily stats CSV
            </button>
            <button
              type="button"
              className={btnClass}
              disabled={insights.length === 0}
              onClick={() => void copyInsights()}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy insights
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="space-y-1 text-[10px] uppercase tracking-wide text-zinc-500">
            Source filter
            <select
              className={cn(inputClass, "cursor-pointer")}
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as CsvSourceType | "all")
              }
            >
              {SOURCE_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All sources" : s}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-[10px] uppercase tracking-wide text-zinc-500">
            From
            <input
              type="date"
              className={inputClass}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-[10px] uppercase tracking-wide text-zinc-500">
            To
            <input
              type="date"
              className={inputClass}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label
            className={cn(
              btnClass,
              "mt-auto cursor-pointer gap-2 self-end",
              showEventMarkers && "ring-1 ring-violet-500/40",
            )}
          >
            <input
              type="checkbox"
              className="accent-violet-600"
              checked={showEventMarkers}
              onChange={(e) => setShowEventMarkers(e.target.checked)}
            />
            Show event markers
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_METRICS.map((key) => (
            <label
              key={key}
              className={cn(
                btnClass,
                "cursor-pointer gap-2",
                selectedMetrics.includes(key) && "ring-1 ring-violet-500/40",
              )}
            >
              <input
                type="checkbox"
                className="accent-violet-600"
                checked={selectedMetrics.includes(key)}
                onChange={() => toggleMetric(key)}
              />
              {TREND_METRIC_LABELS[key]}
            </label>
          ))}
        </div>

        {undatedFileCount > 0 && csvBundles.length > 0 ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Set dates for uploaded files to enable trend analysis (
            {undatedFileCount} without date).
          </p>
        ) : null}

        {!mounted || chartData.length < 1 || selectedMetrics.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">
            {selectedMetrics.length === 0
              ? "Select at least one metric."
              : emptyMessage}
          </p>
        ) : (
          <div className="h-72 w-full min-w-0 rounded-xl border border-white/40 bg-white/20 p-2 dark:border-white/10 dark:bg-white/5 sm:h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={{ stroke: "rgba(167,139,250,0.2)" }}
                />
                {countSelected ? (
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={{ stroke: "rgba(167,139,250,0.2)" }}
                    width={48}
                  />
                ) : null}
                {paceSelected ? (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={{ stroke: "rgba(16,185,129,0.2)" }}
                    tickFormatter={(v) => formatSecondsToPace(Number(v))}
                    width={56}
                  />
                ) : null}
                <Tooltip content={<TrendTooltip selectedMetrics={selectedMetrics} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {selectedMetrics.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={TREND_METRIC_LABELS[key]}
                    stroke={METRIC_COLORS[key]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    yAxisId={PACE_METRICS.has(key) ? "right" : "left"}
                    connectNulls
                  />
                ))}
                {showEventMarkers
                  ? chartData
                      .filter((p) => p.events.length > 0 && p.eventY != null)
                      .map((p) => (
                        <ReferenceDot
                          key={`evt-${p.date}`}
                          x={p.label}
                          y={p.eventY as number}
                          yAxisId={countSelected ? "left" : "right"}
                          r={6}
                          fill="#e879f9"
                          stroke="#a855f7"
                          strokeWidth={2}
                        />
                      ))
                  : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {insights.length > 0 ? (
        <GlassCard padding="lg" className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            Observations
          </h3>
          <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            {insights.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-violet-400">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
  selectedMetrics,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; payload: ChartPoint }>;
  label?: string;
  selectedMetrics: TrendMetricKey[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="max-w-xs rounded-lg border border-violet-300/40 bg-white/95 px-3 py-2 text-xs shadow-lg dark:bg-zinc-900/95">
      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{label}</p>
      <div className="mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-300">
        {selectedMetrics.map((key) => {
          const raw = point[key];
          if (typeof raw !== "number") return null;
          return (
            <p key={key}>
              {TREND_METRIC_LABELS[key]}: {formatMetricValue(key, raw)}
            </p>
          );
        })}
      </div>
      {point.events.length > 0 ? (
        <div className="mt-2 border-t border-violet-200/50 pt-2 dark:border-violet-500/20">
          {point.events.map((e) => (
            <div key={e.id} className="mt-1 text-zinc-600 dark:text-zinc-300">
              <p className="font-medium text-fuchsia-700 dark:text-fuchsia-300">
                {TIMELINE_EVENT_LABELS[e.type]}: {e.title}
              </p>
              {e.description ? <p>{e.description}</p> : null}
              {e.durationMinutes != null ? (
                <p className="text-zinc-400">{e.durationMinutes} min</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
