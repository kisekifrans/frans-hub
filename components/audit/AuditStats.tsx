"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import type { AuditSessionRecord } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

interface AuditStatsProps {
  session: AuditSessionRecord;
  filteredCount: number;
  totalCount: number;
  discrepancyCount: number;
}

export function AuditStats({
  session,
  filteredCount,
  totalCount,
  discrepancyCount,
}: AuditStatsProps) {
  const cards = [
    { label: "Reviewed", value: session.reviewedCount, accent: "text-violet-600" },
    { label: "Agreed", value: session.agreedCount, accent: "text-emerald-600" },
    { label: "Disagreed", value: session.disagreedCount, accent: "text-rose-600" },
    { label: "Discrepancies", value: discrepancyCount, accent: "text-amber-600" },
    { label: "Showing", value: filteredCount, sub: `of ${totalCount}` },
    {
      label: "Progress",
      value: `${session.progressPercent}%`,
      accent: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <GlassCard key={c.label} padding="sm" className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {c.label}
          </p>
          <p
            className={cn(
              "mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-white",
              c.accent,
            )}
          >
            {c.value}
          </p>
          {c.sub ? (
            <p className="text-[10px] text-zinc-400">{c.sub}</p>
          ) : null}
        </GlassCard>
      ))}
    </div>
  );
}
