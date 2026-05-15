"use client";

import { motion } from "framer-motion";
import { KeyboardVisualizer } from "@/components/typing/KeyboardVisualizer";
import { GlassCard } from "@/components/ui/GlassCard";
import { BossSpriteCanvas } from "@/components/typingmonster/BossSpriteCanvas";
import { CombatTypingArea } from "@/components/typingmonster/CombatTypingArea";
import { DamagePopups } from "@/components/typingmonster/DamagePopups";
import { HpBar } from "@/components/typingmonster/HpBar";
import { BOSS_NAME, DIFFICULTY_CONFIG } from "@/lib/typingmonster/boss-config";
import type { useTypingMonsterGame } from "@/hooks/useTypingMonsterGame";
import { cn } from "@/lib/utils";

type Game = ReturnType<typeof useTypingMonsterGame>;

interface GameArenaProps {
  game: Game;
}

export function GameArena({ game }: GameArenaProps) {
  const cfg = DIFFICULTY_CONFIG[game.difficulty];
  const comboPulse = game.combo > 0 && game.combo % 5 === 0;
  const specialProgress =
    game.combo > 0
      ? (game.combo % cfg.comboSpecialInterval) / cfg.comboSpecialInterval
      : 0;

  return (
    <motion.div
      key={game.shake}
      initial={false}
      animate={{ x: game.shake ? [0, -4, 4, -2, 2, 0] : 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-3xl space-y-4"
    >
      <header className="space-y-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {BOSS_NAME}
            </h2>
            <p className="text-xs capitalize text-zinc-500">
              {game.difficulty} mode
            </p>
          </div>
          <div className="min-w-[140px] max-w-xs flex-1">
            <HpBar
              label="Boss HP"
              current={game.bossHp}
              max={game.bossMaxHp}
              variant="boss"
            />
          </div>
        </div>
      </header>

      <GlassCard
        padding="sm"
        className="relative flex min-h-[240px] items-end justify-center overflow-hidden"
      >
        <DamagePopups popups={game.popups} />
        <BossSpriteCanvas
          animState={game.bossAnim}
          hitFlash={game.hitFlash}
        />
      </GlassCard>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill
          label="Combo"
          value={game.combo}
          highlight={comboPulse}
          className="text-fuchsia-600 dark:text-fuchsia-300"
        />
        <StatPill label="WPM" value={game.stats.wpm} />
        <StatPill label="Accuracy" value={`${game.stats.accuracy}%`} />
        <StatPill
          label="Crit meter"
          value={`${game.critMeter}%`}
          className="text-amber-600 dark:text-amber-400"
        />
      </section>

      <div className="glass-card rounded-full px-3 py-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-black/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
            animate={{ width: `${Math.min(100, specialProgress * 100)}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
        <p className="mt-1 text-center text-[10px] text-zinc-500">
          Special at {cfg.comboSpecialInterval} combo
        </p>
      </div>

      <CombatTypingArea
        text={game.targetText}
        cursor={game.charIndex}
        mistakes={game.mistakes}
        specialActive={game.specialActive}
        inputRef={game.inputRef}
        onFocus={() => game.inputRef.current?.focus({ preventScroll: true })}
      />

      <HpBar
        label="Your HP"
        current={game.playerHp}
        max={game.playerMaxHp}
        variant="player"
      />

      <KeyboardVisualizer pressedKeys={game.pressedKeys} />
    </motion.div>
  );
}

function StatPill({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      animate={highlight ? { scale: [1, 1.04, 1] } : {}}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-xl px-3 py-2 text-center"
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-bold tabular-nums text-zinc-900 dark:text-white",
          className,
        )}
      >
        {value}
      </p>
    </motion.div>
  );
}
