"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface CombatTypingAreaProps {
  text: string;
  cursor: number;
  mistakes: ReadonlySet<number>;
  specialActive: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFocus: () => void;
}

function CombatTypingAreaInner({
  text,
  cursor,
  mistakes,
  specialActive,
  inputRef,
  onFocus,
}: CombatTypingAreaProps) {
  return (
    <div
      data-typing-area
      className={cn(
        "glass-card relative cursor-text overflow-hidden rounded-2xl border p-5 sm:p-6",
        specialActive &&
          "ring-2 ring-amber-400/50 shadow-[0_0_32px_rgba(251,191,36,0.25)]",
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        onFocus();
      }}
    >
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-hidden
        className="absolute inset-0 h-full w-full cursor-text opacity-0 sm:pointer-events-none sm:h-px sm:w-px"
        readOnly
        tabIndex={-1}
      />

      {specialActive ? (
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-amber-500">
          Special word  Ecritical hit!
        </p>
      ) : null}

      <p className="flex min-h-[3.5rem] flex-wrap items-baseline justify-center gap-x-[0.15em] gap-y-1 text-center font-mono text-2xl leading-relaxed tracking-wide sm:text-3xl">
        {text.split("").map((char, i) => {
          const done = i < cursor;
          const current = i === cursor;
          const wrong = mistakes.has(i);
          return (
            <span
              key={`${i}-${char}`}
              className={cn(
                "transition-colors duration-75",
                wrong && "text-rose-500",
                done && !wrong && "text-zinc-400 dark:text-zinc-500",
                current &&
                  !wrong &&
                  "rounded bg-violet-500/30 text-zinc-900 underline decoration-violet-500 decoration-2 underline-offset-4 dark:text-white",
                current &&
                  wrong &&
                  "rounded bg-rose-500/25 text-rose-600",
                !done &&
                  !current &&
                  !wrong &&
                  "text-zinc-700 dark:text-zinc-300",
                specialActive && !done && !wrong && "text-amber-200/90",
              )}
            >
              {char === " " ? "\u00a0" : char}
            </span>
          );
        })}
      </p>

      <p className="mt-3 text-center text-[10px] text-zinc-500">
        Type to attack · <kbd className="rounded border border-white/25 px-1">Esc</kbd>{" "}
        reset · <kbd className="rounded border border-white/25 px-1">Tab</kbd> new run
      </p>
    </div>
  );
}

export const CombatTypingArea = memo(CombatTypingAreaInner);
