"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { AnalyticsSeriesPoint } from "@/lib/types";

interface TrendChartProps {
  title: string;
  series: AnalyticsSeriesPoint[];
  className?: string;
}

export function TrendChart({ title, series, className }: TrendChartProps) {
  const max = Math.max(
    ...series.map((p) => Math.max(p.views, p.clicks)),
    1,
  );

  if (series.length === 0) {
    return (
      <GlassCard padding="md" className={className}>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {title}
        </h3>
        <p className="mt-4 text-sm text-zinc-500">No data in this period</p>
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
      <div className="flex h-36 items-end justify-between gap-1 overflow-x-auto pb-1 sm:h-40 sm:gap-2">
        {series.map((point) => (
          <div
            key={point.key}
            className="flex min-w-[28px] flex-1 flex-col items-center gap-2 sm:min-w-0"
          >
            <div className="flex h-32 w-full items-end justify-center gap-0.5 sm:h-36">
              <div
                className="w-[42%] rounded-t-lg bg-violet-500 opacity-80 transition-all duration-500 hover:opacity-100"
                style={{
                  height: `${(point.views / max) * 100}%`,
                  minHeight: point.views > 0 ? 8 : 0,
                }}
                title={`${point.views} views`}
              />
              <div
                className="w-[42%] rounded-t-lg bg-cyan-500 opacity-80 transition-all duration-500 hover:opacity-100"
                style={{
                  height: `${(point.clicks / max) * 100}%`,
                  minHeight: point.clicks > 0 ? 8 : 0,
                }}
                title={`${point.clicks} clicks`}
              />
            </div>
            <span className="max-w-full truncate text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
