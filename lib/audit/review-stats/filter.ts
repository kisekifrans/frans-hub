import { normalizeEmail } from "@/lib/audit/outreach/emails";
import type { OutreachRecord } from "@/lib/audit/outreach/types";

/** Remove rows whose email appears in the exclude list (normalized, case-insensitive). */
export function excludeEmailsFromRecords(
  records: OutreachRecord[],
  excludedEmails: string[],
): OutreachRecord[] {
  if (excludedEmails.length === 0) return records;
  const set = new Set(excludedEmails.map(normalizeEmail));
  return records.filter((r) => !set.has(r.email));
}
