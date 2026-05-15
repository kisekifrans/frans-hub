"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface BreakdownChartProps {
  title: string;
  data: Record<string, number>;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "bg-violet-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-indigo-500",
];

export function BreakdownChart({
  title,
  data,
  colors = DEFAULT_COLORS,
}: BreakdownChartProps) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <GlassCard padding="md" className="h-full">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">No data yet</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(([label, value], i) => {
            const pct = Math.round((value / total) * 100);
            return (
              <li key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="capitalize text-zinc-600 dark:text-zinc-300">
                    {label}
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/30 dark:bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      colors[i % colors.length],
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
