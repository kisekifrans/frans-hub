"use client";

import { motion } from "framer-motion";
import { RotateCcw, Trophy, Skull } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { GameStats } from "@/lib/typingmonster/types";

interface EndScreenProps {
  variant: "victory" | "defeat";
  stats: GameStats;
  onRetry: () => void;
}

export function EndScreen({ variant, stats, onRetry }: EndScreenProps) {
  const won = variant === "victory";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto w-full max-w-md"
    >
      <GlassCard padding="lg" className="text-center">
        <div
          className={
            won
              ? "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20"
              : "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20"
          }
        >
          {won ? (
            <Trophy className="h-8 w-8 text-amber-500" />
          ) : (
            <Skull className="h-8 w-8 text-rose-500" />
          )}
        </div>

        <h2
          className={
            won
              ? "text-2xl font-bold text-violet-600 dark:text-violet-300"
              : "text-2xl font-bold text-rose-600 dark:text-rose-400"
          }
        >
          {won ? "Victory!" : "Defeated"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {won
            ? "The boss has fallen. Your typing was lethal."
            : "The boss overwhelmed you. Try again."}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] uppercase text-zinc-500">WPM</p>
            <p className="text-lg font-bold tabular-nums">{stats.wpm}</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] uppercase text-zinc-500">Accuracy</p>
            <p className="text-lg font-bold tabular-nums">{stats.accuracy}%</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] uppercase text-zinc-500">Max combo</p>
            <p className="text-lg font-bold tabular-nums">{stats.maxCombo}</p>
          </div>
        </div>

        <button
          type="button"
          autoFocus
          onClick={onRetry}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-700"
        >
          <RotateCcw className="h-4 w-4" />
          Battle again
        </button>

        <p className="mt-3 text-xs text-zinc-500">
          <kbd className="rounded border border-white/25 px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          or{" "}
          <kbd className="rounded border border-white/25 px-1.5 py-0.5 font-mono text-[10px]">
            Tab
          </kbd>{" "}
          to retry
        </p>
      </GlassCard>
    </motion.div>
  );
}
