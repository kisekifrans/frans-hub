"use client";

import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface ReviewStatsHeroCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accent: "violet" | "emerald" | "amber" | "sky";
}

const accentStyles = {
  violet: {
    border: "border-violet-500/30",
    gradient:
      "from-violet-600/20 via-violet-500/10 to-transparent dark:from-violet-600/25",
    label: "text-violet-700 dark:text-violet-300",
    icon: "text-violet-500/70",
  },
  emerald: {
    border: "border-emerald-500/25",
    gradient:
      "from-emerald-600/15 via-emerald-500/5 to-transparent dark:from-emerald-600/20",
    label: "text-emerald-800 dark:text-emerald-300",
    icon: "text-emerald-500/70",
  },
  amber: {
    border: "border-amber-500/30",
    gradient:
      "from-amber-500/20 via-amber-500/8 to-transparent dark:from-amber-600/20",
    label: "text-amber-800 dark:text-amber-300",
    icon: "text-amber-500/70",
  },
  sky: {
    border: "border-sky-500/30",
    gradient:
      "from-sky-500/20 via-sky-500/8 to-transparent dark:from-sky-600/20",
    label: "text-sky-800 dark:text-sky-300",
    icon: "text-sky-500/70",
  },
};

export function ReviewStatsHeroCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent,
}: ReviewStatsHeroCardProps) {
  const styles = accentStyles[accent];

  return (
    <GlassCard
      padding="lg"
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        styles.border,
        styles.gradient,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              styles.label,
            )}
          >
            {label}
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-zinc-900 dark:text-white sm:text-5xl">
            {value}
          </p>
          <p className="mt-2 truncate text-xs text-zinc-500" title={subtitle}>
            {subtitle}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            "bg-white/40 dark:bg-white/10",
            styles.icon,
          )}
        >
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </div>
      </div>
    </GlassCard>
  );
}
