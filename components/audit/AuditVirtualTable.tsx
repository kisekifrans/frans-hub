"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { AuditDashboardState } from "@/components/audit/audit-types";
import { isDiscrepancy } from "@/lib/audit/columns";
import type { AuditRowRecord } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

interface AuditVirtualTableProps {
  audit: AuditDashboardState;
}

const ROW_H = 46;

type ColKey =
  | "idx"
  | "episode"
  | "auditor"
  | "result"
  | "reason"
  | "notes"
  | "done";

type ColDef = {
  key: ColKey;
  label: string;
  width: number;
  minWidth: number;
};

const COL_DEFS: ColDef[] = [
  { key: "idx", label: "#", width: 48, minWidth: 40 },
  { key: "episode", label: "Episode", width: 112, minWidth: 80 },
  { key: "auditor", label: "Auditor", width: 220, minWidth: 140 },
  { key: "result", label: "QA Result", width: 96, minWidth: 72 },
  { key: "reason", label: "Reject Reason", width: 140, minWidth: 100 },
  { key: "notes", label: "Notes", width: 168, minWidth: 100 },
  { key: "done", label: "Done", width: 52, minWidth: 44 },
];

function formatStatusLabel(value: string): string {
  const v = value.trim();
  if (!v || v === "—") return "—";
  const lower = v.toLowerCase();
  if (lower === "agree") return "Agree";
  if (lower === "disagree") return "Disagree";
  return lower.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
}

function gridTemplate(widths: Record<ColKey, number>) {
  return COL_DEFS.map((c) => `${widths[c.key]}px`).join(" ");
}

export function AuditVirtualTable({ audit }: AuditVirtualTableProps) {
  const {
    session,
    filteredRows,
    selectedRowId,
    setSelectedRowId,
    getCell,
  } = audit;

  const parentRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(() =>
    Object.fromEntries(COL_DEFS.map((c) => [c.key, c.width])) as Record<
      ColKey,
      number
    >,
  );

  const resizeRef = useRef<{
    key: ColKey;
    startX: number;
    startWidth: number;
  } | null>(null);

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_H,
    overscan: 16,
  });

  const selectedIndex = filteredRows.findIndex((r) => r.id === selectedRowId);
  const template = useMemo(() => gridTemplate(colWidths), [colWidths]);

  useEffect(() => {
    if (selectedIndex < 0) return;
    virtualizer.scrollToIndex(selectedIndex, {
      align: "auto",
      behavior: "smooth",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scroll when selection index changes
  }, [selectedIndex]);

  const onResizeMove = useCallback((e: MouseEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    const def = COL_DEFS.find((c) => c.key === r.key);
    if (!def) return;
    const next = Math.max(def.minWidth, r.startWidth + (e.clientX - r.startX));
    setColWidths((prev) => ({ ...prev, [r.key]: next }));
  }, []);

  const onResizeEnd = useCallback(() => {
    resizeRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", onResizeEnd);
  }, [onResizeMove]);

  const startResize = useCallback(
    (e: React.MouseEvent, key: ColKey) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        key,
        startX: e.clientX,
        startWidth: colWidths[key],
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onResizeMove);
      window.addEventListener("mouseup", onResizeEnd);
    },
    [colWidths, onResizeMove, onResizeEnd],
  );

  useEffect(() => () => onResizeEnd(), [onResizeEnd]);

  if (!session) return null;

  const map = session.columnMap;
  const auditorEmailHeader = session.originalHeaders.find(
    (h) => h.toLowerCase().replace(/[^a-z0-9]/g, "") === "auditoremail",
  );

  const auditorDisplay = (data: Record<string, string>) => {
    const email = auditorEmailHeader
      ? getCell(data, auditorEmailHeader).trim()
      : "";
    if (email) return email;
    const name = getCell(data, map.auditor).trim();
    return name || "—";
  };

  const rejectReasonDisplay = (data: Record<string, string>) => {
    const reason = getCell(data, map.rejectionReason).trim();
    return reason || "—";
  };

  const auditorNotesDisplay = (data: Record<string, string>) => {
    const note = getCell(data, map.notes).trim();
    return note || "—";
  };

  const cellFor = (row: AuditRowRecord, key: ColKey) => {
    const data = row.rowData;
    switch (key) {
      case "idx":
        return String(row.rowIndex + 1);
      case "episode":
        return getCell(data, map.episodeId) || "—";
      case "auditor":
        return auditorDisplay(data);
      case "result":
        return formatStatusLabel(getCell(data, map.reviewerResult) || "—");
      case "reason":
        return rejectReasonDisplay(data);
      case "notes":
        return auditorNotesDisplay(data);
      case "done":
        return row.auditCompleted ? "✓" : "";
      default:
        return "";
    }
  };

  const cellTitle = (row: AuditRowRecord, key: ColKey) => {
    const text = cellFor(row, key);
    if (text === "—" || text === "✓") return undefined;
    if (key === "auditor" || key === "notes") return text;
    return undefined;
  };

  return (
    <div className="glass-card flex flex-col overflow-hidden rounded-2xl border">
      <div
        className="sticky top-0 z-20 shrink-0 border-b border-white/30 bg-white/55 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/75"
        style={{ display: "grid", gridTemplateColumns: template }}
      >
        {COL_DEFS.map((col, i) => (
          <div
            key={col.key}
            className="relative truncate px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
          >
            {col.label}
            {i < COL_DEFS.length - 1 ? (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${col.label} column`}
                className="absolute -right-0.5 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-violet-400/35 active:bg-violet-400/50"
                onMouseDown={(e) => startResize(e, col.key)}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div
        ref={parentRef}
        className="h-[min(52vh,520px)] min-h-0 overflow-auto scroll-smooth"
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const row = filteredRows[vi.index];
            const selected = row.id === selectedRowId;
            const hovered = row.id === hoverId;
            const zebra = vi.index % 2 === 1;
            const discrepancy = isDiscrepancy(
              row.rowData,
              map,
              row.adminDecision,
            );
            const isAgree = row.adminDecision === "agree";
            const isDisagree = row.adminDecision === "disagree";

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedRowId(row.id)}
                onMouseEnter={() => setHoverId(row.id)}
                onMouseLeave={() => setHoverId(null)}
                className={cn(
                  "absolute left-0 grid w-full border-b border-white/15 text-left text-xs transition-[background-color,box-shadow,border-color] duration-200 ease-out dark:border-white/5",
                  !isAgree &&
                    !isDisagree &&
                    zebra &&
                    !selected &&
                    "bg-white/20 dark:bg-white/[0.03]",
                  !isAgree &&
                    !isDisagree &&
                    hovered &&
                    !selected &&
                    "bg-white/50 dark:bg-white/10",
                  isAgree &&
                    !selected &&
                    !hovered &&
                    "bg-emerald-500/[0.07] shadow-[inset_0_0_0_1px_rgba(110,231,183,0.14),0_0_10px_rgba(52,211,153,0.06)] dark:bg-emerald-500/10",
                  isAgree &&
                    hovered &&
                    !selected &&
                    "bg-emerald-500/[0.12] shadow-[inset_0_0_0_1px_rgba(110,231,183,0.22),0_0_14px_rgba(52,211,153,0.1)] dark:bg-emerald-500/14",
                  isDisagree &&
                    !selected &&
                    !hovered &&
                    "bg-rose-500/[0.07] shadow-[inset_0_0_0_1px_rgba(251,182,193,0.16),0_0_10px_rgba(244,114,182,0.06)] dark:bg-rose-500/10",
                  isDisagree &&
                    hovered &&
                    !selected &&
                    "bg-rose-500/[0.12] shadow-[inset_0_0_0_1px_rgba(251,182,193,0.24),0_0_14px_rgba(244,114,182,0.1)] dark:bg-rose-500/14",
                  selected &&
                    !isAgree &&
                    !isDisagree &&
                    hovered &&
                    "z-10 border-l-2 border-l-violet-400/85 bg-violet-500/16 ring-1 ring-inset ring-violet-400/28",
                  selected &&
                    !isAgree &&
                    !isDisagree &&
                    !hovered &&
                    "z-10 border-l-2 border-l-violet-400/80 bg-violet-500/12 ring-1 ring-inset ring-violet-400/20",
                  selected &&
                    isAgree &&
                    hovered &&
                    "z-10 border-l-2 border-l-emerald-400/80 bg-emerald-500/18 ring-1 ring-inset ring-emerald-400/35 shadow-[0_0_18px_rgba(52,211,153,0.14)] dark:bg-emerald-500/20",
                  selected &&
                    isAgree &&
                    !hovered &&
                    "z-10 border-l-2 border-l-emerald-400/75 bg-emerald-500/14 ring-1 ring-inset ring-emerald-400/30 shadow-[0_0_16px_rgba(52,211,153,0.12)] dark:bg-emerald-500/16",
                  selected &&
                    isDisagree &&
                    hovered &&
                    "z-10 border-l-2 border-l-rose-400/80 bg-rose-500/18 ring-1 ring-inset ring-rose-400/35 shadow-[0_0_18px_rgba(244,114,182,0.14)] dark:bg-rose-500/20",
                  selected &&
                    isDisagree &&
                    !hovered &&
                    "z-10 border-l-2 border-l-rose-400/75 bg-rose-500/14 ring-1 ring-inset ring-rose-400/30 shadow-[0_0_16px_rgba(244,114,182,0.12)] dark:bg-rose-500/16",
                  discrepancy &&
                    !selected &&
                    "ring-1 ring-inset ring-amber-400/20",
                  discrepancy &&
                    selected &&
                    "ring-amber-400/25",
                )}
                style={{
                  height: vi.size,
                  transform: `translateY(${vi.start}px)`,
                  gridTemplateColumns: template,
                }}
              >
                {COL_DEFS.map((col) => {
                  const value = cellFor(row, col.key);
                  const title = cellTitle(row, col.key);
                  return (
                    <span
                      key={col.key}
                      className={cn(
                        "truncate px-2 py-2.5 font-medium",
                        col.key === "auditor" && "font-normal",
                      )}
                      title={title}
                    >
                      {value}
                    </span>
                  );
                })}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
