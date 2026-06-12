"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import type { CsvBundle } from "@/lib/audit/csv-bundles";
import type { CsvSourceType } from "@/lib/audit/review-stats/types";
import { cn } from "@/lib/utils";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-2 py-1.5 text-xs text-zinc-800 dark:text-zinc-100";

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

const SOURCE_OPTIONS: CsvSourceType[] = [
  "Reviewer",
  "Auditor",
  "Mixed",
  "Other",
];

interface CsvFileListProps {
  bundles: CsvBundle[];
  mergedRowCount: number;
  uniqueEmailCount: number;
  excludedRowCount: number;
  workingRecordCount: number;
  includeListActive: boolean;
  includeMatchedCount: number;
  undatedFileCount: number;
  onUpdateBundle: (
    id: string,
    patch: Partial<Pick<CsvBundle, "reportDate" | "sourceType" | "label">>,
  ) => void;
  onRemoveBundle: (id: string) => void;
  onClearAll: () => void;
}

export function CsvFileList({
  bundles,
  mergedRowCount,
  uniqueEmailCount,
  excludedRowCount,
  workingRecordCount,
  includeListActive,
  includeMatchedCount,
  undatedFileCount,
  onUpdateBundle,
  onRemoveBundle,
  onClearAll,
}: CsvFileListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (bundles.length === 0) return null;

  return (
    <div className="space-y-3">
      {undatedFileCount > 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Set dates for uploaded files to enable trend analysis (
          {undatedFileCount} without date).
        </p>
      ) : null}
      <p className="text-xs text-zinc-500">
        Assign dates to files to compare productivity across days. Add timeline
        notes for bugs, training, or priority changes that may explain
        performance shifts.
      </p>
      <ul className="space-y-2">
        {bundles.map((bundle) => {
          const expanded = expandedId === bundle.id;
          return (
            <li
              key={bundle.id}
              className="rounded-lg border border-white/40 bg-white/25 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() =>
                    setExpandedId(expanded ? null : bundle.id)
                  }
                >
                  {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  )}
                  <span className="truncate font-medium text-violet-600 dark:text-violet-300">
                    {bundle.label?.trim() || bundle.name}
                  </span>
                  {bundle.reportDate ? (
                    <span className="shrink-0 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-700 dark:text-violet-300">
                      {bundle.reportDate}
                    </span>
                  ) : (
                    <span className="shrink-0 text-amber-600 dark:text-amber-400">
                      No date
                    </span>
                  )}
                </button>
                <span className="text-zinc-500">{bundle.rows.length} rows</span>
                <button
                  type="button"
                  className={cn(btnClass, "px-2 py-1")}
                  onClick={() => onRemoveBundle(bundle.id)}
                  aria-label={`Remove ${bundle.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {expanded ? (
                <div className="grid gap-2 border-t border-white/30 px-3 py-3 sm:grid-cols-3 dark:border-white/10">
                  <label className="space-y-1 text-[10px] uppercase tracking-wide text-zinc-500">
                    Report date
                    <input
                      type="date"
                      className={inputClass}
                      value={bundle.reportDate ?? ""}
                      onChange={(e) =>
                        onUpdateBundle(bundle.id, {
                          reportDate: e.target.value || undefined,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-1 text-[10px] uppercase tracking-wide text-zinc-500">
                    Source
                    <select
                      className={cn(inputClass, "cursor-pointer")}
                      value={bundle.sourceType ?? "Other"}
                      onChange={(e) =>
                        onUpdateBundle(bundle.id, {
                          sourceType: e.target.value as CsvSourceType,
                        })
                      }
                    >
                      {SOURCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-[10px] uppercase tracking-wide text-zinc-500 sm:col-span-1">
                    Label
                    <input
                      type="text"
                      className={inputClass}
                      placeholder={bundle.name}
                      value={bundle.label ?? ""}
                      onChange={(e) =>
                        onUpdateBundle(bundle.id, {
                          label: e.target.value || undefined,
                        })
                      }
                    />
                  </label>
                  <p className="sm:col-span-3 text-[10px] text-zinc-400">
                    File: {bundle.name}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span>
          {bundles.length} file{bundles.length === 1 ? "" : "s"} · {mergedRowCount}{" "}
          raw rows · {uniqueEmailCount} unique emails
        </span>
        {excludedRowCount > 0 ? ` · ${workingRecordCount} after exclude` : ""}
        {includeListActive ? ` · ${includeMatchedCount} in include list` : ""}
        <button type="button" className={btnClass} onClick={onClearAll}>
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>
    </div>
  );
}
