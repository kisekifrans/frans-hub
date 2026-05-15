"use client";

import {
  CheckCheck,
  Download,
  LogOut,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { AuditExportColumns } from "@/components/audit/AuditExportColumns";
import type { AuditDashboardState } from "@/components/audit/audit-types";
import type { AuditFilterState } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

interface AuditToolbarProps {
  audit: AuditDashboardState;
}

const inputClass =
  "glass-card w-full min-w-0 rounded-lg border-0 px-2.5 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const selectClass = cn(inputClass, "cursor-pointer");

const btnClass =
  "glass-card inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

export function AuditToolbar({ audit }: AuditToolbarProps) {
  const {
    filters,
    setFilters,
    reviewerOptions,
    rejectionOptions,
    filteredRows,
    rows,
    bulkDecision,
    exportRows,
    saveStatus,
    closeWorkspace,
    session,
    workflowPrefs,
    setWorkflowPrefs,
    exportColumns,
    setExportColumns,
  } = audit;

  const patch = (partial: Partial<AuditFilterState>) =>
    setFilters({ ...filters, ...partial });

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save error"
          : saveStatus === "pending"
            ? "Pending…"
            : "";

  return (
    <div className="sticky top-0 z-20 space-y-3 rounded-2xl border border-white/40 bg-white/50 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <button type="button" onClick={closeWorkspace} className={btnClass}>
            <LogOut className="h-3.5 w-3.5" />
            Sessions
          </button>
          {session ? (
            <span className="truncate text-xs text-zinc-500">{session.fileName}</span>
          ) : null}
        </div>
        {saveLabel ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-medium",
              saveStatus === "error"
                ? "bg-rose-500/15 text-rose-700"
                : "bg-violet-500/15 text-violet-700 dark:text-violet-300",
            )}
          >
            {saveLabel}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <input
          className={inputClass}
          placeholder="Episode ID"
          value={filters.searchEpisode}
          onChange={(e) => patch({ searchEpisode: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Auditor"
          value={filters.searchAuditor}
          onChange={(e) => patch({ searchAuditor: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Notes / project"
          value={filters.searchNotes}
          onChange={(e) => patch({ searchNotes: e.target.value })}
        />
        <select
          className={selectClass}
          value={filters.reviewerResult}
          onChange={(e) => patch({ reviewerResult: e.target.value })}
        >
          <option value="">All results</option>
          {reviewerOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.rejectionReason}
          onChange={(e) => patch({ rejectionReason: e.target.value })}
        >
          <option value="">All reject reasons</option>
          {rejectionOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.reviewed}
          onChange={(e) =>
            patch({
              reviewed: e.target.value as AuditFilterState["reviewed"],
            })
          }
        >
          <option value="all">All rows</option>
          <option value="reviewed">Reviewed</option>
          <option value="unreviewed">Unreviewed</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className={cn(selectClass, "w-auto min-w-[8rem]")}
          value={filters.adminDecision}
          onChange={(e) =>
            patch({
              adminDecision: e.target.value as AuditFilterState["adminDecision"],
            })
          }
        >
          <option value="all">All decisions</option>
          <option value="agree">Agree only</option>
          <option value="disagree">Disagree only</option>
          <option value="discrepancy">Discrepancies</option>
        </select>

        <button
          type="button"
          className={btnClass}
          onClick={() => void bulkDecision("agree", "filtered")}
        >
          <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
          Agree filtered
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => void bulkDecision("disagree", "filtered")}
        >
          <ThumbsDown className="h-3.5 w-3.5 text-rose-600" />
          Disagree filtered
        </button>

        <span className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

        <AuditExportColumns
          selected={exportColumns}
          onChange={setExportColumns}
        />

        <button type="button" className={btnClass} onClick={() => exportRows("filtered")}>
          <Download className="h-3.5 w-3.5" />
          Export filtered
        </button>
        <button type="button" className={btnClass} onClick={() => exportRows("disagreed")}>
          <Download className="h-3.5 w-3.5" />
          Export disagreed
        </button>
        <button type="button" className={btnClass} onClick={() => exportRows("all")}>
          <CheckCheck className="h-3.5 w-3.5" />
          Export full
        </button>

        {(filters.searchEpisode ||
          filters.searchAuditor ||
          filters.searchNotes ||
          filters.reviewerResult ||
          filters.rejectionReason ||
          filters.reviewed !== "all" ||
          filters.adminDecision !== "all") && (
          <button
            type="button"
            className={btnClass}
            onClick={() =>
              setFilters({
                searchEpisode: "",
                searchAuditor: "",
                searchNotes: "",
                auditStatus: "",
                reviewerResult: "",
                rejectionReason: "",
                reviewed: "all",
                adminDecision: "all",
              })
            }
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        <label className={cn(btnClass, "cursor-pointer gap-2")}>
          <input
            type="checkbox"
            className="accent-violet-600"
            checked={workflowPrefs.autoNextAfterDecision}
            onChange={(e) =>
              setWorkflowPrefs({ autoNextAfterDecision: e.target.checked })
            }
          />
          Auto-next after agree/disagree
        </label>
        <label className={cn(btnClass, "cursor-pointer gap-2")}>
          <input
            type="checkbox"
            className="accent-violet-600"
            checked={workflowPrefs.autoNextAfterReview}
            onChange={(e) =>
              setWorkflowPrefs({ autoNextAfterReview: e.target.checked })
            }
          />
          Auto-next after review
        </label>

        <span className="ml-auto text-xs text-zinc-500">
          {filteredRows.length} / {rows.length} rows
          {saveLabel ? ` · ${saveLabel}` : ""}
        </span>
      </div>
    </div>
  );
}
