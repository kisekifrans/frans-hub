import { formatSecondsToPace } from "./pace";
import type { DailyStats } from "./types";

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportDailyStatsCsv(stats: DailyStats[]): string {
  const headers = [
    "date",
    "totalReviews",
    "averageReviews",
    "averageMedianPace",
    "totalHours",
    "averageHours",
    "uniqueEmails",
    "belowThresholdCount",
    "zeroReviewCount",
    "eventCount",
    "eventTitles",
  ];

  const lines = [headers.join(",")];

  for (const d of stats) {
    const row = [
      d.date,
      d.totalReviews,
      d.averageReviews,
      d.averageMedianPaceSeconds != null
        ? formatSecondsToPace(d.averageMedianPaceSeconds)
        : "",
      d.totalHours ?? "",
      d.averageHours != null ? Math.round(d.averageHours * 100) / 100 : "",
      d.uniqueEmails,
      d.belowThresholdCount,
      d.zeroReviewCount,
      d.events.length,
      d.events.map((e) => e.title).join("; "),
    ];
    lines.push(row.map(escapeCsv).join(","));
  }

  return lines.join("\n");
}

export function downloadDailyStatsCsv(stats: DailyStats[], fileName?: string) {
  const content = exportDailyStatsCsv(stats);
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName ?? `daily-review-stats-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
