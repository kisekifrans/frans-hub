import { getCell } from "@/lib/audit/columns";
import type { AuditRowRecord, ColumnMap } from "@/lib/audit/types";

export const EXPORT_COLUMN_KEYS = [
  "episode_id",
  "auditor_email",
  "qa_result",
  "reject_reason",
  "reviewer_notes",
  "admin_decision",
  "admin_notes",
  "reviewed_at",
  "project",
  "status",
] as const;

export type ExportColumnKey = (typeof EXPORT_COLUMN_KEYS)[number];

export const EXPORT_COLUMN_LABELS: Record<ExportColumnKey, string> = {
  episode_id: "Episode ID",
  auditor_email: "Auditor email",
  qa_result: "QA result",
  reject_reason: "Reject reason",
  reviewer_notes: "Reviewer notes",
  admin_decision: "Admin decision",
  admin_notes: "Admin notes",
  reviewed_at: "Reviewed at",
  project: "Project",
  status: "Status",
};

const STORAGE_KEY = "frans-hub-audit-export-columns";

export function loadExportColumns(): ExportColumnKey[] {
  if (typeof window === "undefined") return [...EXPORT_COLUMN_KEYS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...EXPORT_COLUMN_KEYS];
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((k): k is ExportColumnKey =>
      EXPORT_COLUMN_KEYS.includes(k as ExportColumnKey),
    );
    return valid.length > 0 ? valid : [...EXPORT_COLUMN_KEYS];
  } catch {
    return [...EXPORT_COLUMN_KEYS];
  }
}

export function saveExportColumns(columns: ExportColumnKey[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
}

function formatAdminDecision(value: string | null): string {
  if (!value) return "";
  if (value === "agree") return "Agree";
  if (value === "disagree") return "Disagree";
  return value;
}

function resolveProject(data: Record<string, string>): string {
  return (data.Project ?? data.project ?? "").trim();
}

export function getExportCellValue(
  row: AuditRowRecord,
  key: ExportColumnKey,
  columnMap: ColumnMap,
  auditorEmailHeader?: string,
): string {
  const data = row.rowData;

  switch (key) {
    case "episode_id":
      return getCell(data, columnMap.episodeId);
    case "auditor_email":
      if (auditorEmailHeader) {
        const email = getCell(data, auditorEmailHeader).trim();
        if (email) return email;
      }
      return getCell(data, columnMap.auditor);
    case "qa_result":
      return getCell(data, columnMap.reviewerResult);
    case "reject_reason":
      return getCell(data, columnMap.rejectionReason);
    case "reviewer_notes":
      return getCell(data, columnMap.notes);
    case "admin_decision":
      return formatAdminDecision(row.adminDecision);
    case "admin_notes": {
      const parts = [row.adminRejectReason, row.adminRejectNote].filter(Boolean);
      return parts.join(" | ");
    }
    case "reviewed_at":
      return row.reviewedAt ?? "";
    case "project":
      return resolveProject(data);
    case "status": {
      const fromCsv = getCell(data, columnMap.auditStatus);
      if (fromCsv) return fromCsv;
      return row.auditCompleted ? "Reviewed" : "Unreviewed";
    }
    default:
      return "";
  }
}
