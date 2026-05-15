"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Swords } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DifficultySelector } from "@/components/typingmonster/DifficultySelector";
import { BOSS_NAME } from "@/lib/typingmonster/boss-config";
import type { Difficulty } from "@/lib/typingmonster/types";

interface LandingScreenProps {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
}

export function LandingScreen({
  difficulty,
  onDifficultyChange,
  onStart,
}: LandingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-lg flex-col items-center text-center"
    >
      <Link
        href="/"
        className="glass-card mb-6 flex h-9 w-9 items-center justify-center self-start rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
        aria-label="Back home"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <GlassCard padding="lg" className="w-full">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20">
          <Swords className="h-7 w-7 text-violet-600 dark:text-violet-300" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Typing Monster
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Defeat bosses by typing correctly. Build combos for critical strikes.
        </p>
        <p className="mt-1 text-xs text-violet-600 dark:text-violet-300">
          Boss: {BOSS_NAME}
        </p>

        <div className="mt-6">
          <DifficultySelector
            value={difficulty}
            onChange={onDifficultyChange}
          />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-violet-500/35 transition hover:brightness-110"
        >
          Start battle
        </button>

        <p className="mt-4 text-[10px] text-zinc-500">
          <kbd className="rounded border border-white/25 px-1">Tab</kbd> quick restart
          during battle
        </p>
      </GlassCard>
    </motion.div>
  );
}
