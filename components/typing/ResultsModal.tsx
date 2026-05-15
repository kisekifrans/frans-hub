"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ResultsModalProps {
  result: {
    wpm: number;
    accuracy: number;
    correctChars: number;
    durationMs: number;
  } | null;
  onRestart: () => void;
  onClose: () => void;
}

export function ResultsModal({ result, onRestart, onClose }: ResultsModalProps) {
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, onRestart]);

  return (
    <AnimatePresence>
      {result ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-typing-skip-focus
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            aria-label="Close results"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-title"
          >
            <GlassCard padding="lg" className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 hover:bg-white/40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <motion.p
                id="results-title"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-sm font-medium text-violet-600 dark:text-violet-300"
              >
                Session complete
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mt-2 text-5xl font-bold tabular-nums text-zinc-900 dark:text-white"
              >
                {result.wpm}
                <span className="ml-2 text-lg font-medium text-zinc-500">WPM</span>
              </motion.p>
              <p className="mt-2 text-sm text-zinc-500">
                {result.accuracy}% accuracy · {result.correctChars} chars
              </p>
              <p className="mt-4 text-xs text-zinc-500">
                Press{" "}
                <kbd className="rounded border border-white/30 bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
                  Tab
                </kbd>{" "}
                or{" "}
                <kbd className="rounded border border-white/30 bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
                  Enter
                </kbd>{" "}
                to restart
              </p>
              <motion.div
                className="mt-6 flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
              >
                <button
                  type="button"
                  autoFocus
                  onClick={onRestart}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="glass-card rounded-xl px-5 py-2.5 text-sm font-medium"
                >
                  Continue
                </button>
              </motion.div>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
