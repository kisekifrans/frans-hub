"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Gauge,
  Loader2,
  Star,
  Table2,
  Timer,
  Trash2,
  TrendingDown,
  Trophy,
  X,
} from "lucide-react";
import { ReviewStatsHeroCard } from "@/components/audit/review-stats/ReviewStatsHeroCard";
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
    csvSources,
    mergedRowCount,
    columnMap,
    setColumnMap,
    columnOptions,
    records,
    addCsvFiles,
    removeCsvBundle,
    uploading,
    clearData,
    missingColumns,
    ignoreZeroReviews,
    setIgnoreZeroReviews,
    reviewsBelowThreshold,
    setReviewsBelowThreshold,
    searchEmail,
    setSearchEmail,
    excludeEmailPaste,
    setExcludeEmailPaste,
    excludeEmails,
    excludedRowCount,
    includeEmailPaste,
    setIncludeEmailPaste,
    includeEmails,
    filterByIncludeList,
    setFilterByIncludeList,
    includeListActive,
    includeMatchedCount,
    includeMissingCount,
    workingRecords,
    datasetStats,
    filteredStats,
    belowThresholdRecords,
    tableSourceRecords,
    tableRecords,
  } = useQaReviewStats();

  const [showTable, setShowTable] = useState(true);
  const hasData = records.length > 0 && !missingColumns;

  const patchMap = (patch: Partial<OutreachColumnMap>) =>
    setColumnMap({ ...columnMap, ...patch });

  const copyBelowEmails = async () => {
    const emails = tableSourceRecords.map((r) => r.email).join("\n");
    if (!emails) {
      toast.error("No emails to copy");
      return;
    }
    await copyText(emails);
    toast.success(`Copied ${tableSourceRecords.length} emails`);
  };

  const statsSubtitle = includeListActive
    ? `${filteredStats.activeRows} of ${includeEmails.length} pasted emails in CSV`
    : `${filteredStats.activeRows} reviewers with reviews < ${reviewsBelowThreshold}`;

  const totalReviewsLabel = includeListActive
    ? "Total reviews (cohort)"
    : "Total reviews (filtered)";

  return (
    <div className="space-y-6">
      <GlassCard padding="lg" className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Import Productivity CSV
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Export .csv files from User Management — add multiple files to
            combine; duplicate emails sum reviews across files.
          </p>
        </div>
        <AuditUploadDropzone
          uploading={uploading}
          multiple
          onFiles={addCsvFiles}
        />
        {csvSources.length > 0 ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {csvSources.map((source) => (
                <li
                  key={source.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/40 bg-white/25 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                >
                  <span className="font-medium text-violet-600 dark:text-violet-300">
                    {source.name}
                  </span>
                  <span className="text-zinc-500">{source.rowCount} rows</span>
                  <button
                    type="button"
                    className={cn(btnClass, "ml-auto px-2 py-1")}
                    onClick={() => removeCsvBundle(source.id)}
                    aria-label={`Remove ${source.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>
                {csvSources.length} file{csvSources.length === 1 ? "" : "s"} ·{" "}
                {mergedRowCount} raw rows · {records.length} unique emails
              </span>
              {excludedRowCount > 0
                ? ` · ${workingRecords.length} after exclude`
                : ""}
              {includeListActive
                ? ` · ${includeMatchedCount} in include list`
                : ""}
              <button type="button" className={btnClass} onClick={clearData}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ReviewStatsHeroCard
              label="Average reviews"
              value={String(filteredStats.avgReviews)}
              subtitle={statsSubtitle}
              icon={Gauge}
              accent="violet"
            />
            <ReviewStatsHeroCard
              label="Average median pace"
              value={filteredStats.avgMedianPace}
              subtitle={
                filteredStats.medianPaceDataCount > 0
                  ? `${filteredStats.medianPaceDataCount} in filter · pace data`
                  : "Map Median Pace column (seconds or 2m 9s)"
              }
              icon={Timer}
              accent="emerald"
            />
            <ReviewStatsHeroCard
              label="Highest hours"
              value={filteredStats.highestHours.value}
              subtitle={
                filteredStats.highestHours.email
                  ? filteredStats.highestHours.email
                  : "Map Hours column to see top reviewer"
              }
              icon={Clock}
              accent="amber"
            />
            <ReviewStatsHeroCard
              label="Highest median pace"
              value={filteredStats.highestMedianPace.value}
              subtitle={
                filteredStats.highestMedianPace.email
                  ? filteredStats.highestMedianPace.email
                  : "Map Median Pace column to see top reviewer"
              }
              icon={Trophy}
              accent="sky"
            />
            <ReviewStatsHeroCard
              label="Highest reviews"
              value={filteredStats.highestReviews.value}
              subtitle={
                filteredStats.highestReviews.email
                  ? filteredStats.highestReviews.email
                  : "Top review count in filtered set"
              }
              icon={Star}
              accent="rose"
            />
            <ReviewStatsHeroCard
              label="Lowest median pace"
              value={filteredStats.lowestMedianPace.value}
              subtitle={
                filteredStats.lowestMedianPace.email
                  ? filteredStats.lowestMedianPace.email
                  : "Fastest pace in filtered set"
              }
              icon={TrendingDown}
              accent="fuchsia"
            />
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-3",
              excludedRowCount > 0 ? "sm:grid-cols-4" : "sm:grid-cols-3",
            )}
          >
            <MiniStat
              label="Unique emails"
              value={String(records.length)}
            />
            {excludedRowCount > 0 ? (
              <MiniStat label="Excluded" value={String(excludedRowCount)} />
            ) : null}
            <MiniStat label="In dataset" value={String(datasetStats.totalRows)} />
            {includeListActive ? (
              <MiniStat
                label="In include list"
                value={String(includeMatchedCount)}
                highlight
              />
            ) : (
              <MiniStat
                label={`Reviews < ${reviewsBelowThreshold}`}
                value={String(belowThresholdRecords.length)}
                highlight
              />
            )}
            <MiniStat
              label={totalReviewsLabel}
              value={String(filteredStats.totalReviews)}
              highlight
            />
          </div>

          <GlassCard padding="lg" className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Include Only These Emails
            </h2>
            <p className="text-xs text-zinc-500">
              Paste a list from Sheets — when enabled, only matching rows drive
              stats and the table (after exclude, if any).
            </p>
            <textarea
              className={cn(inputClass, "min-h-[100px] font-mono text-xs")}
              placeholder="reviewer1@example.com&#10;reviewer2@example.com"
              value={includeEmailPaste}
              onChange={(e) => setIncludeEmailPaste(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label
                className={cn(
                  btnClass,
                  "cursor-pointer gap-2",
                  filterByIncludeList && "ring-1 ring-violet-500/40",
                )}
              >
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  checked={filterByIncludeList}
                  onChange={(e) => setFilterByIncludeList(e.target.checked)}
                />
                Only these emails
              </label>
              <span className="text-xs text-zinc-500">
                {includeEmails.length} in list
                {includeListActive
                  ? ` · ${includeMatchedCount} matched in CSV`
                  : ""}
                {includeListActive && includeMissingCount > 0
                  ? ` · ${includeMissingCount} not in CSV`
                  : ""}
              </span>
            </div>
          </GlassCard>

          <GlassCard padding="lg" className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Exclude Emails
            </h2>
            <p className="text-xs text-zinc-500">
              Paste emails to remove from stats and the table (one per line, or
              comma/tab separated). Matching is case-insensitive.
            </p>
            <textarea
              className={cn(inputClass, "min-h-[100px] font-mono text-xs")}
              placeholder="team@example.com&#10;lead@example.com"
              value={excludeEmailPaste}
              onChange={(e) => setExcludeEmailPaste(e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              {excludeEmails.length} in exclude list
              {excludedRowCount > 0
                ? ` · ${excludedRowCount} row${excludedRowCount === 1 ? "" : "s"} removed`
                : excludeEmails.length > 0
                  ? " · no matching rows in CSV"
                  : ""}
            </p>
          </GlassCard>

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
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setReviewsBelowThreshold(Number.isFinite(n) ? n : 0);
                  }}
                />
              </label>
              <button
                type="button"
                className={cn(
                  btnClass,
                  "bg-violet-600 text-white hover:bg-violet-500",
                )}
                onClick={() => void copyBelowEmails()}
                disabled={tableSourceRecords.length === 0}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy {tableSourceRecords.length} emails
              </button>
            </div>
            <input
              className={inputClass}
              placeholder={
                includeListActive
                  ? "Search email in include list…"
                  : "Search email in filtered list…"
              }
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
                  {includeListActive
                    ? "Included reviewers"
                    : `Reviewers below ${reviewsBelowThreshold} reviews`}
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
                  {includeListActive
                    ? "No pasted emails matched the CSV."
                    : "No reviewers match this filter."}
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
