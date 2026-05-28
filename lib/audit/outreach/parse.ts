import { getOutreachCell } from "./columns";
import { normalizeEmail } from "./emails";
import type { OutreachColumnMap, OutreachRecord } from "./types";

function parseReviews(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function buildOutreachRecords(
  rows: Record<string, string>[],
  columnMap: OutreachColumnMap,
  fallbackDate?: string,
): OutreachRecord[] {
  const grouped = new Map<string, OutreachRecord>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const emailRaw = getOutreachCell(row, columnMap.email);
    const email = normalizeEmail(emailRaw);
    if (!email || !email.includes("@")) continue;

    const periodLabel = fallbackDate?.trim() || "that day";
    const reviews = parseReviews(getOutreachCell(row, columnMap.reviews));
    const role = getOutreachCell(row, columnMap.role).trim();
    const medianPace = getOutreachCell(row, columnMap.medianPace).trim();
    const hours = getOutreachCell(row, columnMap.hours).trim();

    const key = email;
    const existing = grouped.get(key);
    if (existing) {
      existing.reviews += reviews;
      if (role) existing.role = role;
      if (medianPace) existing.medianPace = medianPace;
      if (hours) existing.hours = hours;
    } else {
      grouped.set(key, {
        id: key,
        email,
        role,
        date: periodLabel,
        reviews,
        medianPace,
        hours,
        raw: row,
      });
    }
  }

  return [...grouped.values()].sort((a, b) =>
    a.email.localeCompare(b.email),
  );
}
