"use client";

import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CompletionStep } from "@/lib/dashboard/completion";
import { cn } from "@/lib/utils";

interface ActivationProgressCardProps {
  score: number;
  completedCount: number;
  totalCount: number;
  nextAction: string;
  steps: CompletionStep[];
  onOpenStep: (stepId: CompletionStep["id"]) => void;
}

export function ActivationProgressCard({
  score,
  completedCount,
  totalCount,
  nextAction,
  steps,
  onOpenStep,
}: ActivationProgressCardProps) {
  const percent = Math.round((completedCount / Math.max(totalCount, 1)) * 100);

  return (
    <GlassCard className="mb-6 space-y-4 border-violet-200/45 bg-gradient-to-br from-violet-50/60 via-white/70 to-fuchsia-50/35 dark:border-violet-500/20 dark:from-violet-950/20 dark:via-zinc-900/40 dark:to-fuchsia-950/15">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
            <Sparkles className="h-3 w-3" aria-hidden />
            Activation
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
            Build your profile to 100%
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Next best action: {nextAction}
          </p>
        </div>
        <div className="rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-right dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Quality score
          </p>
          <p className="text-xl font-bold text-violet-700 dark:text-violet-300">
            {score}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            Completed {completedCount}/{totalCount} steps
          </span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onOpenStep(step.id)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition",
              step.done
                ? "border-emerald-300/60 bg-emerald-50/60 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                : "border-white/60 bg-white/45 hover:bg-white/65 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.06]",
            )}
          >
            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-400" />
              )}
              {step.label}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {step.hint}
            </p>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
