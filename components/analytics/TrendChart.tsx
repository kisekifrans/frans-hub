"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { chartLabelIndices } from "@/lib/chart-labels";
import { cn } from "@/lib/utils";
import type { AnalyticsSeriesPoint } from "@/lib/types";

interface TrendChartProps {
  title: string;
  series: AnalyticsSeriesPoint[];
  className?: string;
}

function seriesHasTrend(series: AnalyticsSeriesPoint[]): boolean {
  return series.some((p) => p.views > 0 || p.clicks > 0);
}

export function TrendChart({ title, series, className }: TrendChartProps) {
  const max = Math.max(
    ...series.map((p) => Math.max(p.views, p.clicks)),
    1,
  );

  const visibleLabels = useMemo(
    () => chartLabelIndices(series.length),
    [series.length],
  );

  const hasTrend = seriesHasTrend(series);

  if (series.length === 0) {
    return (
      <GlassCard padding="md" className={className}>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {title}
        </h3>
        <p className="mt-4 text-sm text-zinc-500">
          Belum cukup data untuk menampilkan tren
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="md" className={cn("col-span-full", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {title}
        </h3>
        <div className="flex gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Views
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            Clicks
          </span>
        </div>
      </div>

      {!hasTrend ? (
        <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/20 px-4 text-center dark:bg-white/5 sm:h-40">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Belum cukup data untuk menampilkan tren
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Statistik ringkasan di atas tetap diperbarui seiring kunjungan baru.
          </p>
        </div>
      ) : (
        <div className="flex h-36 items-end justify-between gap-1 overflow-x-auto pb-1 sm:h-40 sm:gap-2">
          {series.map((point, index) => (
            <div
              key={point.key}
              className="flex min-w-[32px] flex-1 flex-col items-center gap-2 sm:min-w-0"
            >
              <div className="flex h-32 w-full items-end justify-center gap-0.5 sm:h-36">
                <div
                  className="w-[42%] rounded-t-lg bg-violet-500 opacity-80 transition-all duration-500 hover:opacity-100"
                  style={{
                    height: `${(point.views / max) * 100}%`,
                    minHeight: point.views > 0 ? 8 : 0,
                  }}
                  title={`${point.label}: ${point.views} views`}
                />
                <div
                  className="w-[42%] rounded-t-lg bg-cyan-500 opacity-80 transition-all duration-500 hover:opacity-100"
                  style={{
                    height: `${(point.clicks / max) * 100}%`,
                    minHeight: point.clicks > 0 ? 8 : 0,
                  }}
                  title={`${point.label}: ${point.clicks} clicks`}
                />
              </div>
              <span
                className={cn(
                  "max-w-full truncate text-[10px] sm:text-xs",
                  visibleLabels.has(index)
                    ? "text-zinc-600 dark:text-zinc-300"
                    : "text-transparent select-none",
                )}
                aria-hidden={!visibleLabels.has(index)}
              >
                {visibleLabels.has(index) ? point.label : "\u00a0"}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
