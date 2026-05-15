"use client";

import type { SessionTimingMetrics } from "@/lib/audit/session-timing";
import { cn } from "@/lib/utils";

interface AuditSessionTimingMetaProps {
  metrics: SessionTimingMetrics;
  className?: string;
}

export function AuditSessionTimingMeta({
  metrics,
  className,
}: AuditSessionTimingMetaProps) {
  const parts = [
    metrics.elapsedLabel,
    `${metrics.reviewedCount} reviewed`,
    metrics.rowsPerHourLabel !== "—" ? metrics.rowsPerHourLabel : null,
    metrics.etaLabel,
  ].filter(Boolean);

  return (
    <p
      className={cn(
        "text-center text-[11px] tabular-nums text-zinc-500 sm:text-left",
        className,
      )}
    >
      {parts.join(" · ")}
    </p>
  );
}
