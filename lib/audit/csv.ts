import Papa from "papaparse";
import { detectColumnMap } from "./columns";
import { readCsvText, sanitizeCellValue } from "./encoding";
import {
  getExportCellValue,
  type ExportColumnKey,
} from "./export-columns";
import type { ParsedCsv } from "./types";
import { ADMIN_EXPORT_COLUMNS } from "./types";
import type { AuditRowRecord } from "./types";
import type { ColumnMap } from "./types";

function sanitizeRow(
  row: Record<string, string>,
  headers: string[],
): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const h of headers) {
    const val = row[h];
    cleaned[h] = sanitizeCellValue(val == null ? "" : String(val));
  }
  return cleaned;
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const text = await readCsvText(file);

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => sanitizeCellValue(h.trim()),
      complete: (results) => {
        const headers =
          results.meta.fields?.filter(Boolean).map((h) => sanitizeCellValue(h)) ??
          [];
        const rows = (results.data ?? []).map((row) => sanitizeRow(row, headers));
        resolve({
          headers,
          rows,
          columnMap: detectColumnMap(headers),
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}

function escapeCsvValue(value: string): string {
  const safe = sanitizeCellValue(value);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function exportAuditCsvWithColumns(
  rows: AuditRowRecord[],
  columns: ExportColumnKey[],
  columnMap: ColumnMap,
  auditorEmailHeader?: string,
): string {
  const headerRow = columns.map((k) => escapeCsvValue(k));
  const lines: string[] = [headerRow.join(",")];

  for (const row of rows) {
    const cells = columns.map((key) =>
      escapeCsvValue(
        getExportCellValue(row, key, columnMap, auditorEmailHeader),
      ),
    );
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}

export function exportAuditCsv(
  headers: string[],
  rows: AuditRowRecord[],
  options?: { onlyDisagreed?: boolean },
): string {
  const exportHeaders = [...headers, ...ADMIN_EXPORT_COLUMNS];
  const lines: string[] = [exportHeaders.map(escapeCsvValue).join(",")];

  for (const row of rows) {
    if (options?.onlyDisagreed && row.adminDecision !== "disagree") continue;

    const cells = headers.map((h) =>
      escapeCsvValue(sanitizeCellValue(row.rowData[h] ?? "")),
    );
    cells.push(escapeCsvValue(row.adminDecision ?? ""));
    cells.push(escapeCsvValue(row.adminRejectReason ?? ""));
    cells.push(escapeCsvValue(row.adminRejectNote ?? ""));
    cells.push(escapeCsvValue(row.auditCompleted ? "Yes" : "No"));
    cells.push(escapeCsvValue(row.reviewedAt ?? ""));
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}

export function downloadCsv(content: string, fileName: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
