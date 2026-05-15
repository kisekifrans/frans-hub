"use client";

import Link from "next/link";
import { Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { useTypingTrainer } from "@/hooks/useTypingTrainer";
import { PageShell } from "@/components/ui/PageShell";
import { KeyboardVisualizer } from "@/components/typing/KeyboardVisualizer";
import { ModeSelector } from "@/components/typing/ModeSelector";
import { ResultsModal } from "@/components/typing/ResultsModal";
import { TimerSelector } from "@/components/typing/TimerSelector";
import { TypingGraph } from "@/components/typing/TypingGraph";
import { TypingEngine } from "@/components/typing/TypingEngine";
import { TypingMiniDashboard } from "@/components/typing/TypingMiniDashboard";
import { cn } from "@/lib/utils";

export function TypingTrainer() {
  const t = useTypingTrainer();
  const running = t.phase === "running";

  return (
    <PageShell contentClassName="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10" data-typing-root>
        <header
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
          data-typing-skip-focus
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
              aria-label="Back home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                Type Flow
              </h1>
              <p className="text-xs text-zinc-500">Premium typing trainer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={t.toggleSound}
            className={cn(
              "glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
              t.soundOn && "ring-1 ring-violet-400/40",
            )}
            aria-pressed={t.soundOn}
          >
            {t.soundOn ? (
              <Volume2 className="h-3.5 w-3.5 text-violet-600" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            Sound
          </button>
        </header>

        <div data-typing-skip-focus>
          <TypingMiniDashboard stats={t.stats} />
        </div>

        <div className="mt-4 space-y-3" data-typing-skip-focus>
          <ModeSelector
            value={t.mode}
            onChange={t.setMode}
            disabled={running || !t.ready}
          />
          <TimerSelector
            value={t.timer}
            onChange={t.setTimer}
            disabled={running || !t.ready}
          />
        </div>

        <div className="mt-4 space-y-4">
          {t.ready ? (
            <>
              <TypingEngine
                text={t.text}
                cursor={t.cursor}
                mistakes={t.mistakes}
                shake={t.shake}
                phase={t.phase}
                resetTick={t.resetTick}
                wpm={t.liveWpm}
                accuracy={t.liveAccuracy}
                errors={t.errors}
                timeLeftMs={t.timeLeftMs}
                elapsedMs={t.elapsedMs}
                inputRef={t.inputRef}
                onMobileInput={t.onMobileInput}
                onFocus={t.focusInput}
              />
              <div data-typing-skip-focus>
                <TypingGraph data={t.wpmHistory} />
              </div>
              <KeyboardVisualizer pressedKeys={t.pressedKeys} />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass-card h-16 animate-pulse rounded-2xl"
                    aria-hidden
                  />
                ))}
              </div>
              <div
                className="glass-card h-[10.5rem] animate-pulse rounded-2xl sm:h-[11.75rem]"
                aria-hidden
              />
              <div
                className="glass-card h-40 animate-pulse rounded-2xl"
                aria-hidden
              />
            </>
          )}
        </div>
      </div>

      <ResultsModal
        result={t.lastResult}
        onRestart={() => t.restartTest()}
        onClose={() => t.restartTest()}
      />
    </PageShell>
  );
}
