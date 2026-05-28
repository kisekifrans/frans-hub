import type { OutreachRecord } from "./types";

/** Extract Discord snowflake IDs in paste order. */
export function parseDiscordIdList(text: string): string[] {
  if (!text.trim()) return [];
  const matches = text.match(/\d{17,20}/g);
  return matches ?? [];
}

/** Keep CSV rows in the same order as the email paste list. */
export function orderRecordsByEmailPaste(
  records: OutreachRecord[],
  pasteEmails: string[],
): OutreachRecord[] {
  if (pasteEmails.length === 0) return records;

  const byEmail = new Map(records.map((r) => [r.email, r]));
  const ordered: OutreachRecord[] = [];
  const seen = new Set<string>();

  for (const email of pasteEmails) {
    const rec = byEmail.get(email);
    if (rec && !seen.has(email)) {
      ordered.push(rec);
      seen.add(email);
    }
  }

  for (const rec of records) {
    if (!seen.has(rec.email)) ordered.push(rec);
  }

  return ordered;
}

export function assignDiscordIdsToEmails(
  emails: string[],
  discordIds: string[],
): { map: Record<string, string>; assigned: number; emailCount: number; idCount: number } {
  const map: Record<string, string> = {};
  const n = Math.min(emails.length, discordIds.length);
  for (let i = 0; i < n; i++) {
    map[emails[i]] = discordIds[i];
  }
  return {
    map,
    assigned: n,
    emailCount: emails.length,
    idCount: discordIds.length,
  };
}

const BATCH_MENTION_PREFIX = "frans-hub-qa-outreach-mentions:";

export function loadBatchMentionMap(batchId: string): Record<string, string> {
  if (typeof window === "undefined" || !batchId) return {};
  try {
    const raw = localStorage.getItem(`${BATCH_MENTION_PREFIX}${batchId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveBatchMentionMap(
  batchId: string,
  map: Record<string, string>,
) {
  if (typeof window === "undefined" || !batchId) return;
  localStorage.setItem(
    `${BATCH_MENTION_PREFIX}${batchId}`,
    JSON.stringify(map),
  );
}

export function clearBatchMentionMap(batchId: string) {
  if (typeof window === "undefined" || !batchId) return;
  localStorage.removeItem(`${BATCH_MENTION_PREFIX}${batchId}`);
}
