"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { copy } from "@/lib/academicaudit/copy";
import { formatPercent, levelMeta } from "@/lib/academicaudit/levels";
import type { ParagraphAnalysis } from "@/lib/academicaudit/types";
import { cn } from "@/lib/utils";

export function ParagraphCard({
  paragraph,
  index,
}: {
  paragraph: ParagraphAnalysis;
  index: number;
}) {
  const meta = levelMeta[paragraph.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
    >
      <GlassCard
        padding="md"
        className={cn("border", meta.bg, meta.border)}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-zinc-500">
            Paragraf {paragraph.index + 1}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              meta.bg,
              meta.color,
            )}
          >
            {meta.label} · {formatPercent(paragraph.score)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-4">
          {paragraph.text}
        </p>
        {paragraph.reason ? (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
            {paragraph.reason}
          </p>
        ) : null}
        <p className="mt-2 text-[10px] text-zinc-400">{copy.scoreLabel}</p>
      </GlassCard>
    </motion.div>
  );
}
