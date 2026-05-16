"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { copy } from "@/lib/academicaudit/copy";

interface ProcessingViewProps {
  progress: number;
}

export function ProcessingView({ progress }: ProcessingViewProps) {
  return (
    <GlassCard padding="lg" className="signature-glow text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/25"
      >
        <Loader2 className="h-8 w-8 text-violet-500" />
      </motion.div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
        {copy.processing}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        {copy.processingHint}
      </p>
      <div className="mx-auto mt-8 max-w-sm">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs text-violet-600 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-black/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400"
            style={{ width: `${Math.max(8, progress)}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
