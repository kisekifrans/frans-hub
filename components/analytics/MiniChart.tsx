"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface MiniChartProps {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
}

export function MiniChart({
  title,
  labels,
  values,
  color = "bg-violet-500",
}: MiniChartProps) {
  const max = Math.max(...values, 1);

  return (
    <GlassCard padding="md" className="col-span-full lg:col-span-2">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {title}
      </h3>
      <div className="flex h-36 items-end justify-between gap-1 sm:gap-2">
        {values.map((value, i) => (
          <div key={labels[i]} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn(
                "w-full rounded-t-lg transition-all duration-500",
                color,
                "opacity-80 hover:opacity-100",
              )}
              style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? 8 : 0 }}
              title={`${value}`}
            />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
              {labels[i].slice(5)}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
