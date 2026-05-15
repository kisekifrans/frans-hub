import { getCell, isDiscrepancy } from "./columns";
import type {
  AuditFilterState,
  AuditRowRecord,
  ColumnMap,
} from "./types";

export function filterAuditRows(
  rows: AuditRowRecord[],
  filters: AuditFilterState,
  columnMap: ColumnMap,
): AuditRowRecord[] {
  const ep = filters.searchEpisode.trim().toLowerCase();
  const aud = filters.searchAuditor.trim().toLowerCase();
  const notesQ = filters.searchNotes.trim().toLowerCase();

  return rows.filter((row) => {
    const data = row.rowData;
    const episode = getCell(data, columnMap.episodeId).toLowerCase();
    const auditor = getCell(data, columnMap.auditor).toLowerCase();
    const notes = getCell(data, columnMap.notes).toLowerCase();
    const project = (data.Project ?? data.project ?? "").toLowerCase();
    const reviewer = getCell(data, columnMap.reviewerResult);
    const rejectReason = getCell(data, columnMap.rejectionReason);

    if (ep && !episode.includes(ep)) return false;
    if (aud && !auditor.includes(aud)) return false;
    if (
      notesQ &&
      !notes.includes(notesQ) &&
      !project.includes(notesQ) &&
      !episode.includes(notesQ)
    ) {
      return false;
    }

    if (
      filters.reviewerResult &&
      reviewer.toUpperCase() !== filters.reviewerResult.toUpperCase()
    ) {
      return false;
    }

    if (
      filters.rejectionReason &&
      rejectReason.toLowerCase() !== filters.rejectionReason.toLowerCase()
    ) {
      return false;
    }

    if (filters.reviewed === "reviewed" && !row.auditCompleted) return false;
    if (filters.reviewed === "unreviewed" && row.auditCompleted) return false;

    if (filters.adminDecision === "agree" && row.adminDecision !== "agree") {
      return false;
    }
    if (
      filters.adminDecision === "disagree" &&
      row.adminDecision !== "disagree"
    ) {
      return false;
    }
    if (
      filters.adminDecision === "discrepancy" &&
      !isDiscrepancy(data, columnMap, row.adminDecision)
    ) {
      return false;
    }

    return true;
  });
}

export function uniqueReviewerResults(
  rows: AuditRowRecord[],
  columnMap: ColumnMap,
): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    const v = getCell(row.rowData, columnMap.reviewerResult).trim();
    if (v) set.add(v);
  }
  return Array.from(set).sort();
}

export function uniqueRejectionReasons(
  rows: AuditRowRecord[],
  columnMap: ColumnMap,
): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    const v = getCell(row.rowData, columnMap.rejectionReason).trim();
    if (v && v !== "-") set.add(v);
  }
  return Array.from(set).sort();
}
