"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface CreatorReviewProps {
  text: string;
  creatorName: string;
  className?: string;
}

export function CreatorReview({ text, creatorName, className }: CreatorReviewProps) {
  if (!text.trim()) return null;

  return (
    <GlassCard
      padding="md"
      className={cn(
        "border-violet-500/15 bg-gradient-to-br from-white/50 via-white/35 to-violet-500/10 dark:from-white/10 dark:via-white/5 dark:to-violet-500/10",
        className,
      )}
    >
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
        &ldquo;{text}&rdquo;
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        — {creatorName}
      </p>
    </GlassCard>
  );
}
