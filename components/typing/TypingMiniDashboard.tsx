"use client";

import { memo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useClientMounted } from "@/hooks/useClientMounted";
import {
  getTodayStats,
  getWeeklyWpm,
} from "@/lib/typing/storage";
import type { TypingStatsStore } from "@/lib/typing/types";

interface TypingMiniDashboardProps {
  stats: TypingStatsStore;
}

function TypingMiniDashboardInner({ stats }: TypingMiniDashboardProps) {
  const mounted = useClientMounted();
  const today = mounted
    ? getTodayStats(stats.results)
    : { count: 0, avgWpm: 0, avgAcc: 0 };
  const weekly = mounted ? getWeeklyWpm(stats.results) : [];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <GlassCard padding="sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Today
        </p>
        <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
          {today.count} tests
        </p>
        <p className="text-xs text-zinc-500">
          {today.avgWpm} WPM · {today.avgAcc}% acc
        </p>
      </GlassCard>
      <GlassCard padding="sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Best WPM
        </p>
        <p className="mt-1 text-lg font-bold text-violet-600 dark:text-violet-300">
          {stats.bestWpm}
        </p>
      </GlassCard>
      <GlassCard padding="sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Streak
        </p>
        <p className="mt-1 text-lg font-bold text-fuchsia-600 dark:text-fuchsia-300">
          {stats.streak} day{stats.streak === 1 ? "" : "s"}
        </p>
      </GlassCard>
      <GlassCard padding="sm" className="sm:col-span-2 lg:col-span-1">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Weekly
        </p>
        <div className="h-16 w-full min-w-0">
          {mounted && weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={64} minWidth={0}>
              <BarChart data={weekly}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="wpm" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}

export const TypingMiniDashboard = memo(TypingMiniDashboardInner);
