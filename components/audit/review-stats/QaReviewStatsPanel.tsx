"use client";

import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Table2,
  Trash2,
} from "lucide-react";
import { AuditUploadDropzone } from "@/components/audit/AuditUploadDropzone";
import { QaOutreachDataTable } from "@/components/audit/outreach/QaOutreachDataTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { useQaReviewStats } from "@/hooks/useQaReviewStats";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const selectClass = cn(inputClass, "cursor-pointer");

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function QaReviewStatsPanel() {
  const {
    fileName,
    columnMap,
    setColumnMap,
    columnOptions,
    records,
    uploadCsv,
    uploading,
    clearData,
    missingColumns,
    ignoreZeroReviews,
    setIgnoreZeroReviews,
    reviewsBelowThreshold,
    setReviewsBelowThreshold,
    searchEmail,
    setSearchEmail,
    stats,
    belowThresholdRecords,
    tableRecords,
  } = useQaReviewStats();

  const [showTable, setShowTable] = useState(true);
  const hasData = records.length > 0 && !missingColumns;

  const patchMap = (patch: Partial<OutreachColumnMap>) =>
    setColumnMap({ ...columnMap, ...patch });

  const copyBelowEmails = async () => {
    const emails = belowThresholdRecords.map((r) => r.email).join("\n");
    if (!emails) {
      toast.error("No emails to copy");
      return;
    }
    await copyText(emails);
    toast.success(`Copied ${belowThresholdRecords.length} emails`);
  };

  return (
    <div className="space-y-6">
      <GlassCard padding="lg" className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Import Productivity CSV
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Export the .csv files from the User Management.
          </p>
        </div>
        <AuditUploadDropzone uploading={uploading} onFile={uploadCsv} />
        {fileName ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-violet-600 dark:text-violet-300">
              {fileName}
            </span>
            <span>· {records.length} reviewers</span>
            <button type="button" className={btnClass} onClick={clearData}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        ) : null}
      </GlassCard>

      {columnOptions.length > 0 ? (
        <GlassCard padding="lg" className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Column Mapping
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { key: "email" as const, label: "Email", required: true },
                { key: "reviews" as const, label: "Reviews", required: true },
                {
                  key: "medianPace" as const,
                  label: "Median Pace",
                  required: false,
                },
                { key: "hours" as const, label: "Hours", required: false },
              ] as const
            ).map(({ key, label, required }) => (
              <label key={key} className="space-y-1 text-xs text-zinc-500">
                {label}
                {required ? " *" : ""}
                <select
                  className={selectClass}
                  value={columnMap[key] ?? ""}
                  onChange={(e) =>
                    patchMap({ [key]: e.target.value || undefined })
                  }
                >
                  <option value="">
                    {required ? "— Select —" : "— Optional —"}
                  </option>
                  {columnOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {hasData ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard
              padding="lg"
              className="relative overflow-hidden border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-transparent dark:from-violet-600/25"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Average reviews
                  </p>
                  <p className="mt-2 text-4xl font-bold tabular-nums text-zinc-900 dark:text-white sm:text-5xl">
                    {stats.avgReviews}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {stats.activeRows} reviewers
                    {ignoreZeroReviews && stats.ignoredZeroRows > 0
                      ? ` · ${stats.ignoredZeroRows} with 0 hidden`
                      : ""}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-violet-500/60" />
              </div>
            </GlassCard>

            <GlassCard
              padding="lg"
              className="relative overflow-hidden border-emerald-500/25 bg-gradient-to-br from-emerald-600/15 via-emerald-500/5 to-transparent"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                  Average median pace
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums text-zinc-900 dark:text-white sm:text-5xl">
                  {stats.avgMedianPace}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Mean pace across active reviewers
                </p>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total rows" value={String(stats.totalRows)} />
            <MiniStat label="Active" value={String(stats.activeRows)} />
            <MiniStat
              label="Total reviews"
              value={String(stats.totalReviews)}
            />
            <MiniStat
              label={`Below ${reviewsBelowThreshold}`}
              value={String(belowThresholdRecords.length)}
              highlight
            />
          </div>

          <GlassCard padding="lg" className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Filters
            </h2>
            <div className="flex flex-wrap items-end gap-4">
              <label
                className={cn(
                  btnClass,
                  "cursor-pointer gap-2",
                  ignoreZeroReviews && "ring-1 ring-violet-500/40",
                )}
              >
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  checked={ignoreZeroReviews}
                  onChange={(e) => setIgnoreZeroReviews(e.target.checked)}
                />
                Ignore 0 reviews
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Reviews &lt;</span>
                <input
                  type="number"
                  min={0}
                  className={cn(inputClass, "w-16 px-2 py-1")}
                  value={reviewsBelowThreshold}
                  onChange={(e) =>
                    setReviewsBelowThreshold(Number(e.target.value))
                  }
                />
              </label>
              <button
                type="button"
                className={cn(
                  btnClass,
                  "bg-violet-600 text-white hover:bg-violet-500",
                )}
                onClick={() => void copyBelowEmails()}
                disabled={belowThresholdRecords.length === 0}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy {belowThresholdRecords.length} emails
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Search email in filtered list…"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </GlassCard>

          <GlassCard padding="lg" className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
              onClick={() => setShowTable(!showTable)}
            >
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Reviewers below {reviewsBelowThreshold} reviews
                </h2>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-amber-800 dark:text-amber-300">
                  {tableRecords.length}
                </span>
              </div>
              {showTable ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            {showTable ? (
              tableRecords.length > 0 ? (
                <QaOutreachDataTable rows={tableRecords} dimZeroRows />
              ) : (
                <p className="py-6 text-center text-sm text-zinc-500">
                  No reviewers match this filter.
                </p>
              )
            ) : null}
          </GlassCard>
        </>
      ) : records.length > 0 && missingColumns ? (
        <p className="text-center text-sm text-amber-600">
          Map Email and Reviews to see stats.
        </p>
      ) : null}

      {uploading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </div>
      ) : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/40 bg-white/30 px-3 py-2 dark:border-white/10 dark:bg-white/5",
        highlight && "border-amber-500/30 bg-amber-500/10",
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-white",
          highlight && "text-amber-700 dark:text-amber-300",
        )}
      >
        {value}
      </p>
    </div>
  );
}
