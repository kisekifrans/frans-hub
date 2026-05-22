"use client";

import { Plus, Sparkles } from "lucide-react";

type BlocksEmptyStateProps = {
  onAddLink?: () => void;
};

export function BlocksEmptyState({ onAddLink }: BlocksEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-violet-300/40 bg-gradient-to-b from-violet-50/50 to-white/30 px-5 py-10 text-center dark:border-violet-500/25 dark:from-violet-950/25 dark:to-transparent">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]"
        aria-hidden
      />
      <Sparkles className="relative mx-auto h-5 w-5 text-violet-500/80 dark:text-violet-300/80" />
      <p className="relative mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
        This is where your story starts
      </p>
      <p className="relative mx-auto mt-1.5 max-w-[16rem] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        One link is enough. Momentum beats perfection.
      </p>
      {onAddLink && (
        <button
          type="button"
          onClick={onAddLink}
          className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add a link
        </button>
      )}
    </div>
  );
}
