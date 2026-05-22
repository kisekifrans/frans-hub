"use client";

import { motion } from "framer-motion";
import type { FeedInsight } from "@/lib/finance/insights-feed";
import { cn } from "@/lib/utils";

const toneStyles: Record<FeedInsight["tone"], string> = {
  positive:
    "border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-transparent",
  neutral:
    "border-white/30 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-transparent",
  attention:
    "border-amber-400/35 bg-gradient-to-br from-amber-500/15 to-transparent",
};

const tagStyles: Record<FeedInsight["tone"], string> = {
  positive: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
  neutral: "bg-white/40 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
  attention: "bg-amber-500/25 text-amber-900 dark:text-amber-100",
};

function InsightCard({
  item,
  featured = false,
  index,
}: {
  item: FeedInsight;
  featured?: boolean;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.3, ease: "easeOut" }}
      className={cn(
        "glass-card shrink-0 snap-start rounded-2xl border p-4 shadow-sm",
        toneStyles[item.tone],
        featured ? "min-w-[min(100%,280px)] sm:min-w-[300px]" : "min-w-[220px] max-w-[260px]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none" aria-hidden>
          {item.emoji}
        </span>
        {item.tag && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              tagStyles[item.tone],
            )}
          >
            {item.tag}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-3 font-medium leading-snug text-zinc-800 dark:text-zinc-100",
          featured ? "text-base" : "text-sm",
        )}
      >
        {item.message}
      </p>
    </motion.article>
  );
}

export function FinancialFeed({ insights }: { insights: FeedInsight[] }) {
  if (!insights.length) return null;

  const [hero, ...rest] = insights;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Untuk kamu
          </h2>
          <p className="text-xs text-zinc-500">Ringkas, personal, tanpa drama</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
          </span>
          Live
        </span>
      </div>

      <div className="relative -mx-1">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--page-bg,transparent)] to-transparent"
          aria-hidden
        />
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-none">
          <InsightCard item={hero} featured index={0} />
          {rest.map((item, i) => (
            <InsightCard key={item.id} item={item} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
