"use client";

import type { TimerMode } from "@/lib/typing/types";
import { cn } from "@/lib/utils";

const TIMERS: { id: TimerMode; label: string }[] = [
  { id: 15, label: "15s" },
  { id: 30, label: "30s" },
  { id: 60, label: "60s" },
  { id: 120, label: "120s" },
  { id: "words25", label: "25 words" },
  { id: "words50", label: "50 words" },
  { id: "words100", label: "100 words" },
];

interface TimerSelectorProps {
  value: TimerMode;
  onChange: (timer: TimerMode) => void;
  disabled?: boolean;
}

export function TimerSelector({ value, onChange, disabled }: TimerSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Timer">
      {TIMERS.map((t) => (
        <button
          key={String(t.id)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(t.id)}
          className={cn(
            "glass-card rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
            value === t.id
              ? "bg-fuchsia-600/90 text-white shadow-md shadow-fuchsia-500/20"
              : "text-zinc-600 hover:bg-white/55 dark:text-zinc-300 dark:hover:bg-white/15",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
