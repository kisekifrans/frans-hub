"use client";

import { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypingTextDisplay } from "@/components/typing/TypingTextDisplay";
import type { TypingPhase } from "@/lib/typing/types";
import { cn } from "@/lib/utils";

interface TypingInputProps {
  text: string;
  cursor: number;
  mistakes: ReadonlySet<number>;
  shake: boolean;
  phase: TypingPhase;
  resetTick: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onMobileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusAreaClick: () => void;
}

function TypingInputInner({
  text,
  cursor,
  mistakes,
  shake,
  phase,
  resetTick,
  inputRef,
  onMobileInput,
  onFocusAreaClick,
}: TypingInputProps) {
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [phase, text, resetTick, inputRef]);

  const finished = phase === "finished";

  return (
    <motion.div
      data-typing-area
      animate={
        shake
          ? { x: [0, -5, 5, -3, 3, 0] }
          : finished
            ? { scale: [1, 1.006, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{
        duration: shake ? 0.28 : finished ? 0.4 : 0.16,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "glass-card relative cursor-text overflow-hidden rounded-2xl border p-4 sm:p-6",
        finished && "ring-1 ring-violet-400/35",
      )}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-typing-skip-focus]")) return;
        e.preventDefault();
        onFocusAreaClick();
      }}
      role="textbox"
      aria-label="Typing area. Click to focus."
    >
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full cursor-text opacity-0 sm:pointer-events-none sm:h-px sm:w-px"
        onChange={onMobileInput}
      />

      <TypingTextDisplay
        text={text}
        cursor={cursor}
        mistakes={mistakes}
        phase={phase}
        resetTick={resetTick}
      />

      <motion.div
        className="mt-3 min-h-[1.25rem] text-center text-xs text-zinc-500"
        layout
        transition={{ duration: 0.15 }}
      >
        <AnimatePresence mode="wait">
          {phase === "idle" ? (
            <motion.p
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              Press any key to start ·{" "}
              <kbd className="rounded border border-white/30 bg-white/20 px-1 py-0.5 font-mono text-[10px]">
                Tab
              </kbd>{" "}
              new test
            </motion.p>
          ) : finished ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="text-violet-600 dark:text-violet-300"
            >
              <kbd className="rounded border border-white/30 bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                Tab
              </kbd>{" "}
              or{" "}
              <kbd className="rounded border border-white/30 bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to restart
            </motion.p>
          ) : (
            <motion.p
              key="run"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="opacity-70"
            >
              <kbd className="rounded border border-white/25 bg-white/15 px-1 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              reset ·{" "}
              <kbd className="rounded border border-white/25 bg-white/15 px-1 py-0.5 font-mono text-[10px]">
                Tab
              </kbd>{" "}
              new test
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export const TypingInput = memo(TypingInputInner);
