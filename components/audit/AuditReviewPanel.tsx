"use client";

import { useCallback, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import type { AuditDashboardState } from "@/components/audit/audit-types";
import { isDiscrepancy } from "@/lib/audit/columns";
import { getAtlasReviewUrl } from "@/lib/audit/atlas";
import { REJECT_REASONS } from "@/lib/audit/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface AuditReviewPanelProps {
  audit: AuditDashboardState;
}

export function AuditReviewPanel({ audit }: AuditReviewPanelProps) {
  const {
    session,
    selectedRow,
    patchRow,
    setDecision,
    markReviewed,
    getCell,
    openCurrentAtlasReview,
  } = audit;

  const [copied, setCopied] = useState(false);

  const copyEpisodeId = useCallback(async (episodeId: string) => {
    if (!episodeId) {
      toast.error("No episode ID to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(episodeId);
      setCopied(true);
      toast.success("Episode ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }, []);

  if (!session || !selectedRow) {
    return (
      <GlassCard padding="lg" className="text-sm text-zinc-500">
        Select a row to review.
      </GlassCard>
    );
  }

  const map = session.columnMap;
  const data = selectedRow.rowData;
  const episode = getCell(data, map.episodeId);
  const auditor = getCell(data, map.auditor);
  const reviewer = getCell(data, map.reviewerResult);
  const rejectReason = getCell(data, map.rejectionReason);
  const notes = getCell(data, map.notes);
  const project = data.Project ?? data.project ?? "";
  const atlasUrl = getAtlasReviewUrl(episode);
  const discrepancy = isDiscrepancy(
    data,
    map,
    selectedRow.adminDecision,
  );

  const decisionBtn = (d: "agree" | "disagree", active: boolean) => (
    <button
      type="button"
      onClick={() => setDecision(selectedRow.id, d)}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
        d === "agree"
          ? active
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
            : "glass-card text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
          : active
            ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30"
            : "glass-card text-rose-700 hover:bg-rose-500/10 dark:text-rose-300",
      )}
    >
      {d === "agree" ? (
        <ThumbsUp className="h-4 w-4" />
      ) : (
        <ThumbsDown className="h-4 w-4" />
      )}
      {d === "agree" ? "Agree (A)" : "Disagree (D)"}
    </button>
  );

  return (
    <div className="lg:sticky lg:top-4 lg:self-start">
      <GlassCard padding="lg" className="space-y-4">
        <div className="-mx-1 -mt-1 sticky top-0 z-10 rounded-t-2xl border-b border-white/30 bg-white/60 px-1 pb-3 pt-1 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80">
          <a
            href={atlasUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!atlasUrl) {
                e.preventDefault();
                toast.error("No episode ID for this row");
              }
            }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
              atlasUrl
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700"
                : "glass-card cursor-not-allowed text-zinc-400",
            )}
          >
            <ExternalLink className="h-4 w-4" />
            Open Review (O)
          </a>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Row {selectedRow.rowIndex + 1} · {auditor || "Unknown auditor"}
            </p>
            <div className="mt-1 flex items-start gap-2">
              <h3
                className="min-w-0 flex-1 break-all font-mono text-2xl font-bold leading-tight text-zinc-900 dark:text-white"
                title={episode}
              >
                {episode || "No episode ID"}
              </h3>
              {episode ? (
                <button
                  type="button"
                  onClick={() => void copyEpisodeId(episode)}
                  className="glass-card shrink-0 rounded-lg p-2 text-zinc-500 transition hover:text-violet-600"
                  aria-label="Copy episode ID"
                  title="Copy episode ID"
                >
                  <Copy className={cn("h-4 w-4", copied && "text-violet-600")} />
                </button>
              ) : null}
            </div>
          </div>
          {discrepancy ? (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200">
              Discrepancy
            </span>
          ) : null}
        </div>

        {rejectReason ? (
          <span className="inline-flex max-w-full rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-800 dark:text-rose-200">
            {rejectReason}
          </span>
        ) : null}

        <div className="rounded-xl bg-white/35 p-3 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            QA result
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {reviewer || "—"}
          </p>
        </div>

        {notes ? (
          <div className="rounded-xl border border-white/40 bg-white/40 p-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
              Reviewer notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-100">
              {notes}
            </p>
          </div>
        ) : null}

        {project ? (
          <p className="text-xs text-zinc-500">
            <span className="font-medium">Project:</span> {project}
          </p>
        ) : null}

        <div className="flex gap-2">
          {decisionBtn("agree", selectedRow.adminDecision === "agree")}
          {decisionBtn("disagree", selectedRow.adminDecision === "disagree")}
        </div>

        {selectedRow.adminDecision === "disagree" ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Admin reject reason
            </label>
            <select
              className="glass-card w-full rounded-lg border-0 px-2.5 py-2 text-xs"
              value={selectedRow.adminRejectReason ?? ""}
              onChange={(e) =>
                patchRow(selectedRow.id, {
                  adminRejectReason: e.target.value || null,
                })
              }
            >
              <option value="">Select reason…</option>
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              className="glass-card min-h-[72px] w-full resize-y rounded-lg border-0 px-2.5 py-2 text-xs"
              placeholder="Admin notes (optional)"
              value={selectedRow.adminRejectNote ?? ""}
              onChange={(e) =>
                patchRow(selectedRow.id, {
                  adminRejectNote: e.target.value || null,
                })
              }
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => markReviewed(selectedRow.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-700"
        >
          <Check className="h-4 w-4" />
          Mark reviewed (Enter)
        </button>

        {atlasUrl ? (
          <button
            type="button"
            onClick={() => openCurrentAtlasReview()}
            className="glass-card flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-violet-700 dark:text-violet-300"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in AtlasCapture
          </button>
        ) : null}

        <p className="text-center text-[10px] text-zinc-400">
          A agree · D disagree · O open review · ↑↓ navigate · N/P next/prev · Enter reviewed
        </p>
      </GlassCard>
    </div>
  );
}
