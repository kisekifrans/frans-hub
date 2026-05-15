"use client";

import { FileText, Loader2, Trash2 } from "lucide-react";
import { AuditUploadDropzone } from "@/components/audit/AuditUploadDropzone";
import type { AuditDashboardState } from "@/components/audit/audit-types";
import {
  formatLastOpened,
  getStoredTimingMetrics,
} from "@/lib/audit/session-timing";
import { GlassCard } from "@/components/ui/GlassCard";

interface AuditSessionHomeProps {
  audit: AuditDashboardState;
}

export function AuditSessionHome({ audit }: AuditSessionHomeProps) {
  const { sessions, loading, uploading, openSession, uploadCsv, removeSession } =
    audit;

  return (
    <div className="space-y-6">
      <AuditUploadDropzone uploading={uploading} onFile={uploadCsv} />

      <GlassCard padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Saved sessions
          </h2>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          ) : null}
        </div>

        {sessions.length === 0 && !loading ? (
          <p className="text-sm text-zinc-500">
            No sessions yet. Upload a CSV to start auditing.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => {
              const timing = getStoredTimingMetrics(
                s.id,
                s.reviewedCount,
                s.rowCount,
              );
              return (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-white/40 bg-white/25 p-3 dark:border-white/10 dark:bg-white/5 sm:flex-nowrap"
              >
                <FileText className="h-4 w-4 shrink-0 text-violet-500" />
                <button
                  type="button"
                  onClick={() => openSession(s.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {s.fileName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {s.rowCount} rows · {s.progressPercent}% · opened{" "}
                    {formatLastOpened(s.lastOpenedAt)}
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-zinc-400">
                    {timing.elapsedLabel} · {timing.reviewedCount} reviewed
                    {timing.rowsPerHourLabel !== "—"
                      ? ` · ${timing.rowsPerHourLabel}`
                      : ""}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete session "${s.fileName}"? This cannot be undone.`,
                      )
                    ) {
                      void removeSession(s.id);
                    }
                  }}
                  className="rounded-lg p-2 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-600"
                  aria-label="Delete session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
