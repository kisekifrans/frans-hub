"use client";

import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { copy } from "@/lib/academicaudit/copy";

export function DisclaimerBanner() {
  return (
    <GlassCard
      padding="md"
      className="signature-glow border-amber-200/30 bg-amber-500/5 dark:border-amber-500/20"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {copy.disclaimerTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {copy.disclaimerBody}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
