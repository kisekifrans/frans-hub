"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/ui/PageShell";
import { EndScreen } from "@/components/typingmonster/EndScreen";
import { GameArena } from "@/components/typingmonster/GameArena";
import { LandingScreen } from "@/components/typingmonster/LandingScreen";
import { useTypingMonsterGame } from "@/hooks/useTypingMonsterGame";

export function TypingMonsterApp() {
  const game = useTypingMonsterGame();

  useEffect(() => {
    if (game.screen === "playing") {
      requestAnimationFrame(() =>
        game.inputRef.current?.focus({ preventScroll: true }),
      );
    }
  }, [game.screen, game.inputRef]);

  return (
    <PageShell contentClassName="min-h-screen py-6 sm:py-10">
      <AnimatePresence mode="wait">
        {game.screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <LandingScreen
              difficulty={game.difficulty}
              onDifficultyChange={game.setDifficulty}
              onStart={() => game.startGame(game.difficulty)}
            />
          </motion.div>
        )}

        {game.screen === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameArena game={game} />
          </motion.div>
        )}

        {game.screen === "victory" && (
          <motion.div
            key="victory"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <EndScreen
              variant="victory"
              stats={game.stats}
              onRetry={game.newRun}
            />
          </motion.div>
        )}

        {game.screen === "defeat" && (
          <motion.div
            key="defeat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <EndScreen
              variant="defeat"
              stats={game.stats}
              onRetry={game.newRun}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
