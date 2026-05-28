"use client";

import type { OutreachRecord } from "@/lib/audit/outreach/types";
import { cn } from "@/lib/utils";

interface QaOutreachDataTableProps {
  rows: OutreachRecord[];
  /** Grey out rows with 0 reviews (still visible in import table) */
  dimZeroRows?: boolean;
  className?: string;
}

const thClass =
  "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500";

const tdClass = "px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200";

export function QaOutreachDataTable({
  rows,
  dimZeroRows,
  className,
}: QaOutreachDataTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">No rows to display.</p>
    );
  }

  return (
    <div
      className={cn(
        "max-h-[min(420px,50vh)] overflow-auto rounded-xl border border-white/40 dark:border-white/10",
        className,
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-md dark:bg-zinc-900/90">
          <tr className="border-b border-white/50 dark:border-white/10">
            <th className={thClass}>Email</th>
            <th className={thClass}>Role</th>
            <th className={cn(thClass, "text-right")}>Reviews</th>
            <th className={thClass}>Median pace</th>
            <th className={thClass}>Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isZero = row.reviews === 0;
            return (
            <tr
              key={row.id}
              className={cn(
                "border-b border-white/30 transition hover:bg-violet-500/5 dark:border-white/5",
                i % 2 === 1 && "bg-white/20 dark:bg-white/[0.02]",
                dimZeroRows && isZero && "opacity-45",
              )}
            >
              <td className={cn(tdClass, "max-w-[220px] truncate font-medium")}>
                {row.email}
              </td>
              <td className={cn(tdClass, "whitespace-nowrap")}>
                {row.role || "—"}
              </td>
              <td
                className={cn(
                  tdClass,
                  "text-right tabular-nums font-semibold",
                  row.reviews === 0 && "text-zinc-400",
                  row.reviews > 0 &&
                    row.reviews < 3 &&
                    "text-amber-600 dark:text-amber-400",
                  row.reviews > 5 && "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {row.reviews}
              </td>
              <td className={cn(tdClass, "whitespace-nowrap tabular-nums")}>
                {row.medianPace || "—"}
              </td>
              <td className={cn(tdClass, "whitespace-nowrap tabular-nums")}>
                {row.hours || "—"}
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
