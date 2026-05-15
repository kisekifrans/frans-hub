"use client";

import type { TypingMode } from "@/lib/typing/types";
import { cn } from "@/lib/utils";

const MODES: { id: TypingMode; label: string }[] = [
  { id: "words", label: "Words" },
  { id: "quotes", label: "Quotes" },
  { id: "numbers", label: "Numbers" },
  { id: "code", label: "Code" },
  { id: "english", label: "English" },
  { id: "indonesian", label: "Indonesian" },
];

interface ModeSelectorProps {
  value: TypingMode;
  onChange: (mode: TypingMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="tablist"
      aria-label="Typing mode"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={value === m.id}
          disabled={disabled}
          onClick={() => onChange(m.id)}
          className={cn(
            "glass-card rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
            value === m.id
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
              : "text-zinc-600 hover:bg-white/55 dark:text-zinc-300 dark:hover:bg-white/15",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
