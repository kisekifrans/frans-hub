"use client";

import type { Difficulty } from "@/lib/typingmonster/types";
import { cn } from "@/lib/utils";

const OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "extreme", label: "Extreme" },
];

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

export function DifficultySelector({
  value,
  onChange,
  disabled,
}: DifficultySelectorProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Difficulty"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          className={cn(
            "glass-card rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
            value === opt.id
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
              : "text-zinc-600 hover:bg-white/55 dark:text-zinc-300 dark:hover:bg-white/15",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
