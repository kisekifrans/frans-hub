import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminDecision,
  AuditRowRecord,
  AuditSessionRecord,
  ColumnMap,
} from "@/lib/audit/types";

const BATCH = 200;

interface DbSession {
  id: string;
  admin_email: string;
  file_name: string;
  original_headers: string[];
  column_map: ColumnMap;
  row_count: number;
  reviewed_count: number;
  agreed_count: number;
  disagreed_count: number;
  progress_percent: number;
  status: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

interface DbRow {
  id: string;
  session_id: string;
  row_index: number;
  row_data: Record<string, string>;
  admin_decision: string | null;
  admin_reject_reason: string | null;
  admin_reject_note: string | null;
  audit_completed: boolean;
  reviewed_at: string | null;
}

function sessionFromDb(row: DbSession): AuditSessionRecord {
  return {
    id: row.id,
    adminEmail: row.admin_email,
    fileName: row.file_name,
    originalHeaders: row.original_headers ?? [],
    columnMap: row.column_map ?? {},
    rowCount: row.row_count,
    reviewedCount: row.reviewed_count,
    agreedCount: row.agreed_count,
    disagreedCount: row.disagreed_count,
    progressPercent: Number(row.progress_percent),
    status: row.status as AuditSessionRecord["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at,
  };
}

function rowFromDb(row: DbRow): AuditRowRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    rowIndex: row.row_index,
    rowData: row.row_data ?? {},
    adminDecision: row.admin_decision as AdminDecision | null,
    adminRejectReason: row.admin_reject_reason,
    adminRejectNote: row.admin_reject_note,
    auditCompleted: row.audit_completed,
    reviewedAt: row.reviewed_at,
  };
}

function computeStats(rows: AuditRowRecord[]) {
  let reviewed = 0;
  let agreed = 0;
  let disagreed = 0;
  for (const r of rows) {
    if (r.auditCompleted) reviewed++;
    if (r.adminDecision === "agree") agreed++;
    if (r.adminDecision === "disagree") disagreed++;
  }
  const rowCount = rows.length;
  const progressPercent =
    rowCount > 0 ? Math.round((reviewed / rowCount) * 10000) / 100 : 0;
  return { reviewed, agreed, disagreed, progressPercent };
}

export async function listAuditSessions(
  supabase: SupabaseClient,
  adminEmail: string,
): Promise<AuditSessionRecord[]> {
  const { data, error } = await supabase
    .from("audit_sessions")
    .select("*")
    .eq("admin_email", adminEmail)
    .order("last_opened_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }
  return (data as DbSession[]).map(sessionFromDb);
}

export async function createAuditSession(
  supabase: SupabaseClient,
  params: {
    adminEmail: string;
    fileName: string;
    headers: string[];
    columnMap: ColumnMap;
    rows: Record<string, string>[];
  },
): Promise<{ session: AuditSessionRecord; rows: AuditRowRecord[] }> {
  const now = new Date().toISOString();
  const { data: sessionRow, error: sessionError } = await supabase
    .from("audit_sessions")
    .insert({
      admin_email: params.adminEmail,
      file_name: params.fileName,
      original_headers: params.headers,
      column_map: params.columnMap,
      row_count: params.rows.length,
      reviewed_count: 0,
      agreed_count: 0,
      disagreed_count: 0,
      progress_percent: 0,
      status: "in_progress",
      last_opened_at: now,
    })
    .select()
    .single();

  if (sessionError) throw sessionError;
  const sessionId = (sessionRow as DbSession).id;

  const allRows: AuditRowRecord[] = [];
  for (let i = 0; i < params.rows.length; i += BATCH) {
    const chunk = params.rows.slice(i, i + BATCH).map((rowData, j) => ({
      session_id: sessionId,
      row_index: i + j,
      row_data: rowData,
      admin_decision: null,
      admin_reject_reason: null,
      admin_reject_note: null,
      audit_completed: false,
    }));

    const { data: inserted, error } = await supabase
      .from("audit_rows")
      .insert(chunk)
      .select();

    if (error) throw error;
    allRows.push(...(inserted as DbRow[]).map(rowFromDb));
  }

  await supabase.from("audit_progress").upsert({
    session_id: sessionId,
    current_row_index: 0,
    filter_state: {},
    last_autosave_at: now,
    updated_at: now,
  });

  return {
    session: sessionFromDb(sessionRow as DbSession),
    rows: allRows.sort((a, b) => a.rowIndex - b.rowIndex),
  };
}

export async function loadAuditSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<{
  session: AuditSessionRecord;
  rows: AuditRowRecord[];
  currentRowIndex: number;
  filterState: Record<string, unknown>;
}> {
  const { data: sessionRow, error: sErr } = await supabase
    .from("audit_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sErr || !sessionRow) throw sErr ?? new Error("Session not found");

  const { data: progressRow } = await supabase
    .from("audit_progress")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  const { data: rowData, error: rErr } = await supabase
    .from("audit_rows")
    .select("*")
    .eq("session_id", sessionId)
    .order("row_index", { ascending: true });

  if (rErr) throw rErr;

  await supabase
    .from("audit_sessions")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("id", sessionId);

  return {
    session: sessionFromDb(sessionRow as DbSession),
    rows: (rowData as DbRow[]).map(rowFromDb),
    currentRowIndex: progressRow?.current_row_index ?? 0,
    filterState: (progressRow?.filter_state as Record<string, unknown>) ?? {},
  };
}

export async function saveAuditRow(
  supabase: SupabaseClient,
  row: AuditRowRecord,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("audit_rows")
    .update({
      admin_decision: row.adminDecision,
      admin_reject_reason: row.adminRejectReason,
      admin_reject_note: row.adminRejectNote,
      audit_completed: row.auditCompleted,
      reviewed_at: row.reviewedAt,
      updated_at: now,
    })
    .eq("id", row.id);

  if (error) throw error;
}

export async function syncSessionStats(
  supabase: SupabaseClient,
  sessionId: string,
  rows: AuditRowRecord[],
): Promise<AuditSessionRecord> {
  const { reviewed, agreed, disagreed, progressPercent } = computeStats(rows);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("audit_sessions")
    .update({
      reviewed_count: reviewed,
      agreed_count: agreed,
      disagreed_count: disagreed,
      progress_percent: progressPercent,
      updated_at: now,
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return sessionFromDb(data as DbSession);
}

export async function saveAuditProgress(
  supabase: SupabaseClient,
  sessionId: string,
  currentRowIndex: number,
  filterState: Record<string, unknown>,
): Promise<void> {
  const now = new Date().toISOString();
  await supabase.from("audit_progress").upsert({
    session_id: sessionId,
    current_row_index: currentRowIndex,
    filter_state: filterState,
    last_autosave_at: now,
    updated_at: now,
  });
}

export async function deleteAuditSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("audit_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) throw error;
}

export async function bulkUpdateRows(
  supabase: SupabaseClient,
  updates: AuditRowRecord[],
): Promise<void> {
  const now = new Date().toISOString();
  for (let i = 0; i < updates.length; i += BATCH) {
    const chunk = updates.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      session_id: r.sessionId,
      row_index: r.rowIndex,
      row_data: r.rowData,
      admin_decision: r.adminDecision,
      admin_reject_reason: r.adminRejectReason,
      admin_reject_note: r.adminRejectNote,
      audit_completed: r.auditCompleted,
      reviewed_at: r.reviewedAt,
      updated_at: now,
    }));
    const { error } = await supabase.from("audit_rows").upsert(chunk, {
      onConflict: "id",
    });
    if (error) throw error;
  }
}
