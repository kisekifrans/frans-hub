export type AdminDecision = "agree" | "disagree";

export const ADMIN_EXPORT_COLUMNS = [
  "Admin_Audit_Decision",
  "Admin_Reject_Reason",
  "Admin_Reject_Note",
  "Audit_Completed",
  "Audit_Timestamp",
] as const;

export const REJECT_REASONS = [
  "Wrong Label/Category",
  "Missed Critical Event",
  "Timestamp Inaccuracy",
  "False Positive",
  "False Negative",
  "Poor Video Quality",
  "Double Data",
  "Other (See Notes)",
] as const;

export type RejectReason = (typeof REJECT_REASONS)[number];

export interface ColumnMap {
  episodeId?: string;
  auditor?: string;
  notes?: string;
  reviewerResult?: string;
  rejectionReason?: string;
  auditStatus?: string;
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  columnMap: ColumnMap;
}

export interface AuditRowRecord {
  id: string;
  sessionId: string;
  rowIndex: number;
  rowData: Record<string, string>;
  adminDecision: AdminDecision | null;
  adminRejectReason: string | null;
  adminRejectNote: string | null;
  auditCompleted: boolean;
  reviewedAt: string | null;
}

export interface AuditSessionRecord {
  id: string;
  adminEmail: string;
  fileName: string;
  originalHeaders: string[];
  columnMap: ColumnMap;
  rowCount: number;
  reviewedCount: number;
  agreedCount: number;
  disagreedCount: number;
  progressPercent: number;
  status: "in_progress" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}

export interface AuditFilterState {
  searchEpisode: string;
  searchAuditor: string;
  searchNotes: string;
  auditStatus: string;
  reviewerResult: string;
  rejectionReason: string;
  reviewed: "all" | "reviewed" | "unreviewed";
  adminDecision: "all" | "agree" | "disagree" | "discrepancy";
}

export const DEFAULT_FILTERS: AuditFilterState = {
  searchEpisode: "",
  searchAuditor: "",
  searchNotes: "",
  auditStatus: "",
  reviewerResult: "",
  rejectionReason: "",
  reviewed: "all",
  adminDecision: "all",
};
