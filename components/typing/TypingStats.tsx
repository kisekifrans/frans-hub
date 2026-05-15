"use client";

import { memo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface TypingStatsProps {
  wpm: number;
  accuracy: number;
  errors: number;
  timeLeftMs: number | null;
  elapsedMs: number;
}

function formatTime(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

function TypingStatsInner({
  wpm,
  accuracy,
  errors,
  timeLeftMs,
  elapsedMs,
}: TypingStatsProps) {
  const timeLabel =
    timeLeftMs != null ? formatTime(timeLeftMs) : formatTime(elapsedMs);

  const items = [
    { label: "WPM", value: wpm, accent: "text-violet-600 dark:text-violet-300" },
    { label: "Accuracy", value: `${accuracy}%`, accent: "text-fuchsia-600 dark:text-fuchsia-300" },
    { label: "Errors", value: errors, accent: "text-rose-500" },
    { label: timeLeftMs != null ? "Time left" : "Time", value: timeLabel, accent: "text-zinc-700 dark:text-zinc-200" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <GlassCard key={item.label} padding="sm" className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-0.5 text-xl font-bold tabular-nums",
              item.accent,
            )}
          >
            {item.value}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}

export const TypingStats = memo(TypingStatsInner);
