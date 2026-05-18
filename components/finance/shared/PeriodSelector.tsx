"use client";

import { useFinance } from "@/hooks/useFinance";
import { formatShortDate } from "@/lib/finance/format";
import { daysRemainingInPeriod } from "@/lib/finance/periods";
import { cn } from "@/lib/utils";

export function PeriodSelector({ compact }: { compact?: boolean }) {
  const finance = useFinance();
  if (!finance) return null;

  const { periods, currentPeriodId, setCurrentPeriodId, currentPeriod } =
    finance;

  const daysLeft = currentPeriod
    ? daysRemainingInPeriod(currentPeriod)
    : 0;

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-zinc-500">
          Salary period
        </label>
        {!compact && currentPeriod && (
          <span className="text-xs text-violet-600 dark:text-violet-400">
            {daysLeft} days until next salary
          </span>
        )}
      </div>
      <select
        value={currentPeriodId ?? ""}
        onChange={(e) => setCurrentPeriodId(e.target.value || null)}
        className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 dark:bg-white/5 dark:border-white/10"
      >
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({formatShortDate(p.startDate)} – {formatShortDate(p.endDate)})
          </option>
        ))}
      </select>
    </div>
  );
}
