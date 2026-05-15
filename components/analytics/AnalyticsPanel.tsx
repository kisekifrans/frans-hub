"use client";

import { memo, useCallback, useState } from "react";
import { BarChart3, Eye, MousePointerClick, Users } from "lucide-react";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { StatCard } from "@/components/analytics/StatCard";
import { TopLinksTable } from "@/components/analytics/TopLinksTable";
import { TrendChart } from "@/components/analytics/TrendChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { ctr } from "@/lib/analytics";
import type {
  AnalyticsGranularity,
  AnalyticsPeriod,
  AnalyticsSnapshot,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

const GRANULARITY: { id: AnalyticsGranularity; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

interface AnalyticsPanelProps {
  stats: AnalyticsSnapshot;
  loading?: boolean;
  onPeriodChange: (
    period: AnalyticsPeriod,
    granularity: AnalyticsGranularity,
  ) => Promise<void>;
}

function AnalyticsPanelInner({
  stats,
  loading,
  onPeriodChange,
}: AnalyticsPanelProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>(stats.period);
  const [granularity, setGranularity] = useState<AnalyticsGranularity>(
    stats.granularity,
  );

  const applyPeriod = useCallback(
    async (p: AnalyticsPeriod, g: AnalyticsGranularity) => {
      setPeriod(p);
      setGranularity(g);
      await onPeriodChange(p, g);
    },
    [onPeriodChange],
  );

  const hasActivity = stats.totalViews > 0 || stats.totalClicks > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={loading}
              onClick={() => applyPeriod(p.id, granularity)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                period === p.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                  : "glass-card text-zinc-600 dark:text-zinc-300",
                loading && "opacity-60",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {GRANULARITY.map((g) => (
            <button
              key={g.id}
              type="button"
              disabled={loading}
              onClick={() => applyPeriod(period, g.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                granularity === g.id
                  ? "bg-violet-600/20 text-violet-700 ring-1 ring-violet-500/30 dark:text-violet-200"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
                loading && "opacity-60",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          accent="violet"
        />
        <StatCard
          label="Link clicks"
          value={stats.totalClicks.toLocaleString()}
          icon={MousePointerClick}
          accent="cyan"
        />
        <StatCard
          label="Unique visitors"
          value={stats.uniqueVisitors.toLocaleString()}
          icon={Users}
          accent="emerald"
        />
        <StatCard
          label="Click-through rate"
          value={`${ctr(stats)}%`}
          icon={BarChart3}
          accent="rose"
        />
      </div>

      {!hasActivity ? (
        <GlassCard padding="md" className="text-center">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            No analytics yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Share your hub link to start collecting views, clicks, and visitor
            insights.
          </p>
        </GlassCard>
      ) : (
        <>
          <TrendChart
            title={`Traffic (${granularity})`}
            series={stats.series}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownChart title="Devices" data={stats.devices} />
            <BreakdownChart
              title="Browsers"
              data={stats.browsers}
              colors={[
                "bg-indigo-500",
                "bg-sky-500",
                "bg-violet-500",
                "bg-cyan-500",
                "bg-rose-500",
              ]}
            />
          </div>
          <TopLinksTable links={stats.topLinks} />
        </>
      )}
    </div>
  );
}

export const AnalyticsPanel = memo(AnalyticsPanelInner);
