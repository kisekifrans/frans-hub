"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { openAtlasReview } from "@/lib/audit/atlas";
import {
  EXPORT_COLUMN_KEYS,
  loadExportColumns,
  saveExportColumns,
  type ExportColumnKey,
} from "@/lib/audit/export-columns";
import { parseCsvFile, downloadCsv, exportAuditCsvWithColumns } from "@/lib/audit/csv";
import { sanitizeCellValue } from "@/lib/audit/encoding";
import {
  DEFAULT_WORKFLOW_PREFS,
  loadWorkflowPrefs,
  saveWorkflowPrefs,
  type AuditWorkflowPrefs,
} from "@/lib/audit/preferences";
import {
  filterAuditRows,
  uniqueRejectionReasons,
  uniqueReviewerResults,
} from "@/lib/audit/filters";
import { getCell, isDiscrepancy } from "@/lib/audit/columns";
import type {
  AuditFilterState,
  AuditRowRecord,
  AuditSessionRecord,
  AdminDecision,
} from "@/lib/audit/types";
import { DEFAULT_FILTERS as defaultFilters } from "@/lib/audit/types";
import { deleteSessionTiming } from "@/lib/audit/session-timing";
import {
  bulkUpdateRows,
  createAuditSession,
  deleteAuditSession,
  listAuditSessions,
  loadAuditSession,
  saveAuditProgress,
  saveAuditRow,
  syncSessionStats,
} from "@/lib/supabase/audit-service";
import { useAuditSessionTiming } from "@/hooks/useAuditSessionTiming";

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export function useAuditDashboard(adminEmail: string) {
  const [sessions, setSessions] = useState<AuditSessionRecord[]>([]);
  const [session, setSession] = useState<AuditSessionRecord | null>(null);
  const [rows, setRows] = useState<AuditRowRecord[]>([]);
  const [filters, setFilters] = useState<AuditFilterState>(defaultFilters);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const filteredRowsRef = useRef<AuditRowRecord[]>([]);
  const [workflowPrefs, setWorkflowPrefsState] = useState<AuditWorkflowPrefs>(
    DEFAULT_WORKFLOW_PREFS,
  );
  const [exportColumns, setExportColumnsState] = useState<ExportColumnKey[]>([
    ...EXPORT_COLUMN_KEYS,
  ]);

  useEffect(() => {
    setWorkflowPrefsState(loadWorkflowPrefs());
    setExportColumnsState(loadExportColumns());
  }, []);

  const setExportColumns = useCallback((columns: ExportColumnKey[]) => {
    setExportColumnsState(columns);
    saveExportColumns(columns);
  }, []);

  const setWorkflowPrefs = useCallback((patch: Partial<AuditWorkflowPrefs>) => {
    setWorkflowPrefsState((prev) => {
      const next = { ...prev, ...patch };
      saveWorkflowPrefs(next);
      return next;
    });
  }, []);

  function sanitizeRows(list: AuditRowRecord[]): AuditRowRecord[] {
    return list.map((r) => ({
      ...r,
      rowData: Object.fromEntries(
        Object.entries(r.rowData).map(([k, v]) => [k, sanitizeCellValue(v)]),
      ),
      adminRejectNote: r.adminRejectNote
        ? sanitizeCellValue(r.adminRejectNote)
        : r.adminRejectNote,
      adminRejectReason: r.adminRejectReason
        ? sanitizeCellValue(r.adminRejectReason)
        : r.adminRejectReason,
    }));
  }

  const client = useCallback(() => createClient(), []);

  const refreshSessions = useCallback(async () => {
    if (!isSupabaseConfigured() || !adminEmail) return;
    const list = await listAuditSessions(client(), adminEmail);
    setSessions(list);
  }, [adminEmail, client]);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        toast.error("Supabase not configured");
        return;
      }
      try {
        await refreshSessions();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshSessions]);

  const filteredRows = useMemo(() => {
    if (!session) return [];
    return filterAuditRows(rows, filters, session.columnMap);
  }, [rows, filters, session]);

  filteredRowsRef.current = filteredRows;

  const filteredIds = useMemo(
    () => new Set(filteredRows.map((r) => r.id)),
    [filteredRows],
  );

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selectedRowId) ?? filteredRows[0] ?? null,
    [rows, selectedRowId, filteredRows],
  );

  const reviewerOptions = useMemo(
    () => (session ? uniqueReviewerResults(rows, session.columnMap) : []),
    [rows, session],
  );

  const rejectionOptions = useMemo(
    () => (session ? uniqueRejectionReasons(rows, session.columnMap) : []),
    [rows, session],
  );

  const discrepancyCount = useMemo(() => {
    if (!session) return 0;
    return rows.filter((r) =>
      isDiscrepancy(r.rowData, session.columnMap, r.adminDecision),
    ).length;
  }, [rows, session]);

  const reviewedCount = session?.reviewedCount ?? 0;
  const totalRows = session?.rowCount ?? rows.length;
  const { metrics: sessionTiming, pause: pauseSessionTiming } =
    useAuditSessionTiming(session?.id ?? null, reviewedCount, totalRows);

  const scheduleStatsSync = useCallback(
    async (nextRows: AuditRowRecord[]) => {
      if (!session) return;
      const updated = await syncSessionStats(client(), session.id, nextRows);
      setSession(updated);
      setSessions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
    },
    [session, client],
  );

  const flushSave = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    try {
      if (session) {
        const idx = rowsRef.current.findIndex((r) => r.id === selectedRowId);
        await saveAuditProgress(
          client(),
          session.id,
          idx >= 0 ? idx : 0,
          filters as unknown as Record<string, unknown>,
        );
        await scheduleStatsSync(rowsRef.current);
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [session, selectedRowId, filters, client, scheduleStatsSync]);

  const openSession = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      try {
        const data = await loadAuditSession(client(), sessionId);
        setSession(data.session);
        setRows(sanitizeRows(data.rows));
        setSelectedRowId(data.rows[data.currentRowIndex]?.id ?? data.rows[0]?.id ?? null);
        setFilters({
          ...defaultFilters,
          ...(data.filterState as Partial<AuditFilterState>),
        });
        await refreshSessions();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to open session");
      } finally {
        setLoading(false);
      }
    },
    [client, refreshSessions],
  );

  const uploadCsv = useCallback(
    async (file: File) => {
      if (!adminEmail) return;
      setUploading(true);
      try {
        const parsed = await parseCsvFile(file);
        if (parsed.rows.length === 0) {
          toast.error("No rows found in CSV");
          return;
        }
        const { session: created, rows: createdRows } = await createAuditSession(
          client(),
          {
            adminEmail,
            fileName: file.name,
            headers: parsed.headers,
            columnMap: parsed.columnMap,
            rows: parsed.rows,
          },
        );
        setSession(created);
        setRows(sanitizeRows(createdRows));
        setSelectedRowId(createdRows[0]?.id ?? null);
        setFilters(defaultFilters);
        await refreshSessions();
        toast.success(`Imported ${createdRows.length} rows`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [adminEmail, client, refreshSessions],
  );

  const patchRow = useCallback(
    (rowId: string, patch: Partial<AuditRowRecord>, opts?: { quiet?: boolean }) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === rowId ? { ...r, ...patch } : r,
        );
        rowsRef.current = next;
        return next;
      });
      setSaveStatus("pending");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const row = rowsRef.current.find((r) => r.id === rowId);
        if (!row) return;
        setSaveStatus("saving");
        try {
          await saveAuditRow(client(), row);
          await scheduleStatsSync(rowsRef.current);
          if (session) {
            const idx = rowsRef.current.findIndex((r) => r.id === rowId);
            await saveAuditProgress(
              client(),
              session.id,
              idx,
              filters as unknown as Record<string, unknown>,
            );
          }
          setSaveStatus("saved");
          if (!opts?.quiet) toast.success("Saved", { duration: 1200 });
        } catch (e) {
          setSaveStatus("error");
          toast.error(e instanceof Error ? e.message : "Save failed");
        }
      }, 600);
    },
    [client, session, filters, scheduleStatsSync],
  );

  const navigateRow = useCallback((delta: number) => {
    const list = filteredRowsRef.current;
    if (list.length === 0) return;
    setSelectedRowId((currentId) => {
      const idx = list.findIndex((r) => r.id === currentId);
      const next =
        idx < 0
          ? 0
          : Math.min(list.length - 1, Math.max(0, idx + delta));
      return list[next].id;
    });
  }, []);

  const setDecision = useCallback(
    (rowId: string, decision: AdminDecision) => {
      const row = rowsRef.current.find((r) => r.id === rowId);
      if (!row) return;
      const toggleOff = row.adminDecision === decision;
      patchRow(
        rowId,
        {
          adminDecision: toggleOff ? null : decision,
          auditCompleted: !toggleOff,
          reviewedAt: !toggleOff ? new Date().toISOString() : null,
        },
        { quiet: true },
      );
      if (!toggleOff && workflowPrefs.autoNextAfterDecision) {
        navigateRow(1);
      }
    },
    [patchRow, workflowPrefs.autoNextAfterDecision, navigateRow],
  );

  const markReviewed = useCallback(
    (rowId: string) => {
      patchRow(
        rowId,
        {
          auditCompleted: true,
          reviewedAt: new Date().toISOString(),
        },
        { quiet: true },
      );
      if (workflowPrefs.autoNextAfterReview) {
        navigateRow(1);
      }
    },
    [patchRow, workflowPrefs.autoNextAfterReview, navigateRow],
  );

  const openCurrentAtlasReview = useCallback(() => {
    if (!session) return false;
    const row = rowsRef.current.find((r) => r.id === selectedRowId);
    if (!row) return false;
    const episodeId = getCell(row.rowData, session.columnMap.episodeId);
    const ok = openAtlasReview(episodeId);
    if (!ok) toast.error("No episode ID for this row");
    return ok;
  }, [session, selectedRowId]);

  const bulkDecision = useCallback(
    async (decision: AdminDecision, scope: "filtered" | "all") => {
      const targets =
        scope === "filtered"
          ? filteredRows
          : rowsRef.current;
      const now = new Date().toISOString();
      const updated = rowsRef.current.map((r) => {
        if (scope === "filtered" && !filteredIds.has(r.id)) return r;
        return {
          ...r,
          adminDecision: decision,
          auditCompleted: true,
          reviewedAt: now,
        };
      });
      setRows(updated);
      rowsRef.current = updated;
      setSaveStatus("saving");
      try {
        const toSave =
          scope === "filtered"
            ? updated.filter((r) => filteredIds.has(r.id))
            : updated;
        await bulkUpdateRows(client(), toSave);
        await scheduleStatsSync(updated);
        toast.success(`Marked ${toSave.length} rows as ${decision}`);
        setSaveStatus("saved");
      } catch (e) {
        setSaveStatus("error");
        toast.error(e instanceof Error ? e.message : "Bulk update failed");
      }
    },
    [filteredRows, filteredIds, client, scheduleStatsSync],
  );

  const exportRows = useCallback(
    (mode: "all" | "filtered" | "disagreed") => {
      if (!session) return;
      const columns =
        exportColumns.length > 0 ? exportColumns : [...EXPORT_COLUMN_KEYS];
      if (columns.length === 0) {
        toast.error("Select at least one export column");
        return;
      }

      const source =
        mode === "filtered"
          ? filteredRows
          : mode === "disagreed"
            ? rows.filter((r) => r.adminDecision === "disagree")
            : rows;

      const auditorEmailHeader = session.originalHeaders.find(
        (h) => h.toLowerCase().replace(/[^a-z0-9]/g, "") === "auditoremail",
      );

      const csv = exportAuditCsvWithColumns(
        source,
        columns,
        session.columnMap,
        auditorEmailHeader,
      );
      const suffix =
        mode === "filtered" ? "filtered" : mode === "disagreed" ? "disagreed" : "full";
      downloadCsv(csv, `audit-${suffix}-${Date.now()}.csv`);
      toast.success(`Exported ${source.length} rows`);
    },
    [session, rows, filteredRows, exportColumns],
  );

  const removeSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteAuditSession(client(), sessionId);
        deleteSessionTiming(sessionId);
        if (session?.id === sessionId) {
          setSession(null);
          setRows([]);
          setSelectedRowId(null);
        }
        await refreshSessions();
        toast.success("Session deleted");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete failed");
      }
    },
    [client, session, refreshSessions],
  );

  const closeWorkspace = useCallback(() => {
    pauseSessionTiming();
    void flushSave();
    setSession(null);
    setRows([]);
    setSelectedRowId(null);
    setFilters(defaultFilters);
  }, [flushSave, pauseSessionTiming]);

  return {
    sessions,
    session,
    rows,
    filteredRows,
    selectedRow,
    selectedRowId,
    setSelectedRowId,
    filters,
    setFilters,
    loading,
    uploading,
    saveStatus,
    reviewerOptions,
    rejectionOptions,
    discrepancyCount,
    openSession,
    uploadCsv,
    patchRow,
    setDecision,
    markReviewed,
    navigateRow,
    bulkDecision,
    exportRows,
    removeSession,
    closeWorkspace,
    refreshSessions,
    flushSave,
    getCell,
    workflowPrefs,
    setWorkflowPrefs,
    openCurrentAtlasReview,
    sessionTiming,
    reviewedCount,
    totalRows,
    exportColumns,
    setExportColumns,
  };
}
