"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AuditReviewPanel } from "@/components/audit/AuditReviewPanel";
import { AuditStats } from "@/components/audit/AuditStats";
import { AuditToolbar } from "@/components/audit/AuditToolbar";
import { AuditSessionTimingMeta } from "@/components/audit/AuditSessionTimingMeta";
import { AuditVirtualTable } from "@/components/audit/AuditVirtualTable";
import type { AuditDashboardState } from "@/components/audit/audit-types";

interface AuditWorkspaceProps {
  audit: AuditDashboardState;
}

export function AuditWorkspace({ audit }: AuditWorkspaceProps) {
  const {
    session,
    loading,
    filteredRows,
    rows,
    discrepancyCount,
    selectedRow,
    navigateRow,
    setDecision,
    markReviewed,
    openCurrentAtlasReview,
    sessionTiming,
  } = audit;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!selectedRow) return;

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setDecision(selectedRow.id, "agree");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setDecision(selectedRow.id, "disagree");
      } else if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        openCurrentAtlasReview();
      } else if (e.key === "ArrowDown" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        navigateRow(1);
      } else if (e.key === "ArrowUp" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        navigateRow(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        markReviewed(selectedRow.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedRow,
    setDecision,
    navigateRow,
    markReviewed,
    openCurrentAtlasReview,
  ]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AuditStats
        session={session}
        filteredCount={filteredRows.length}
        totalCount={rows.length}
        discrepancyCount={discrepancyCount}
      />
      {sessionTiming ? <AuditSessionTimingMeta metrics={sessionTiming} /> : null}
      <AuditToolbar audit={audit} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        <AuditVirtualTable audit={audit} />
        <AuditReviewPanel audit={audit} />
      </div>
    </div>
  );
}
