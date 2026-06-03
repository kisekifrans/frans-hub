import { normalizeEmail } from "@/lib/audit/outreach/emails";
import { orderRecordsByEmailPaste } from "@/lib/audit/outreach/discord-mentions";
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

/** Keep only rows whose email is in the include list; preserve paste order when possible. */
export function includeOnlyEmailsFromRecords(
  records: OutreachRecord[],
  includeEmails: string[],
): OutreachRecord[] {
  if (includeEmails.length === 0) return records;
  const set = new Set(includeEmails);
  const matched = records.filter((r) => set.has(r.email));
  return orderRecordsByEmailPaste(matched, includeEmails);
}
