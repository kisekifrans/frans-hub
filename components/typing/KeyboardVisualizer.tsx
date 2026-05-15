"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { KEYBOARD_ROWS } from "@/lib/typing/keyboard-layout";
import type { KeyState } from "@/lib/typing/types";
import { cn } from "@/lib/utils";

interface KeyboardVisualizerProps {
  pressedKeys: Record<string, KeyState>;
}

const spring = { type: "spring" as const, stiffness: 520, damping: 28 };

function rowFlexSum(row: (typeof KEYBOARD_ROWS)[number]) {
  return row.reduce((sum, key) => sum + (key.width ?? 1), 0);
}

const MAX_ROW_FLEX = Math.max(...KEYBOARD_ROWS.map(rowFlexSum));
const MAX_KEY_COUNT = Math.max(...KEYBOARD_ROWS.map((row) => row.length));

function Keycap({
  id,
  label,
  width = 1,
  state,
}: {
  id: string;
  label: string;
  width?: number;
  state: KeyState;
}) {
  return (
    <motion.div
      layout
      animate={{
        scale: state === "idle" ? 1 : 0.94,
        y: state === "idle" ? 0 : 2,
      }}
      transition={spring}
      className={cn(
        "relative flex h-9 min-w-0 items-center justify-center rounded-lg border text-[10px] font-semibold uppercase tracking-wide sm:h-10 sm:text-xs",
        "border-white/35 bg-white/40 backdrop-blur-md dark:border-white/12 dark:bg-white/8",
        state === "expected" &&
          "z-10 border-violet-400/50 bg-violet-500/20 shadow-[0_0_18px_rgba(167,139,250,0.45)] animate-pulse",
        state === "correct" &&
          "border-emerald-400/45 bg-emerald-500/20 shadow-[0_0_14px_rgba(52,211,153,0.35)]",
        state === "wrong" &&
          "border-rose-400/45 bg-rose-500/20 shadow-[0_0_14px_rgba(244,114,182,0.35)]",
      )}
      style={{
        width: `calc(${width} * var(--kb-unit, 2.25rem))`,
        flex: "none",
      }}
      data-key={id}
    >
      <span className="truncate px-0.5 text-zinc-700 dark:text-zinc-200">
        {label}
      </span>
    </motion.div>
  );
}

function KeyboardVisualizerInner({ pressedKeys }: KeyboardVisualizerProps) {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col items-center space-y-1.5 px-1 sm:space-y-2"
      style={
        {
          "--kb-unit": "clamp(1.55rem, 3.6vw, 2.25rem)",
          "--kb-gap": "0.25rem",
          "--kb-row-width": `calc(${MAX_ROW_FLEX} * var(--kb-unit, 2.25rem) + ${MAX_KEY_COUNT - 1} * var(--kb-gap))`,
        } as React.CSSProperties
      }
      aria-hidden
    >
      {KEYBOARD_ROWS.map((row, ri) => (
        <div
          key={ri}
          className="flex max-w-full justify-center gap-1 sm:gap-1.5"
          style={{ width: "var(--kb-row-width)" }}
        >
          {row.map((key) => (
            <Keycap
              key={key.id}
              id={key.id}
              label={key.label}
              width={key.width ?? 1}
              state={pressedKeys[key.id] ?? "idle"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export const KeyboardVisualizer = memo(KeyboardVisualizerInner);
