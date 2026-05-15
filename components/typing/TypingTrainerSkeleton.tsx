"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { GlassCard } from "@/components/ui/GlassCard";

/** Layout placeholder while the typing trainer loads (client-only bundle). */
export function TypingTrainerSkeleton() {
  return (
    <PageShell contentClassName="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
          <div className="glass-card h-8 w-20 animate-pulse rounded-full" />
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} padding="sm" className="animate-pulse">
              <div className="h-3 w-12 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
              <div className="mt-2 h-6 w-16 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
            </GlassCard>
          ))}
        </div>

        <div className="mt-4 h-10 animate-pulse rounded-xl bg-white/30 dark:bg-white/5" />
        <div className="mt-3 h-10 animate-pulse rounded-xl bg-white/30 dark:bg-white/5" />

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <GlassCard key={i} padding="sm" className="h-16 animate-pulse">
                <span className="sr-only">Loading</span>
              </GlassCard>
            ))}
          </div>
          <GlassCard padding="sm" className="h-36 animate-pulse sm:h-40">
            <span className="sr-only">Loading</span>
          </GlassCard>
          <GlassCard padding="sm" className="h-40 animate-pulse">
            <span className="sr-only">Loading</span>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
