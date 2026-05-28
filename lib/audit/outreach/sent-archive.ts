export interface SentArchiveEntry {
  recordId: string;
  email: string;
  ruleLabel: string;
  sentAt: string;
}

const PREFIX = "frans-hub-qa-outreach-sent:";

function storageKey(batchId: string): string {
  return `${PREFIX}${batchId}`;
}

export function loadSentArchive(batchId: string): SentArchiveEntry[] {
  if (typeof window === "undefined" || !batchId) return [];
  try {
    const raw = localStorage.getItem(storageKey(batchId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SentArchiveEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSentArchive(batchId: string, entries: SentArchiveEntry[]) {
  if (typeof window === "undefined" || !batchId) return;
  localStorage.setItem(storageKey(batchId), JSON.stringify(entries));
}

export function markRecordSent(
  batchId: string,
  entry: Omit<SentArchiveEntry, "sentAt">,
): SentArchiveEntry[] {
  const existing = loadSentArchive(batchId);
  if (existing.some((e) => e.recordId === entry.recordId)) return existing;
  const next = [
    ...existing,
    { ...entry, sentAt: new Date().toISOString() },
  ];
  saveSentArchive(batchId, next);
  return next;
}

export function clearSentArchive(batchId: string) {
  if (typeof window === "undefined" || !batchId) return;
  localStorage.removeItem(storageKey(batchId));
}

export function isRecordSent(
  batchId: string,
  recordId: string,
  archive?: SentArchiveEntry[],
): boolean {
  const list = archive ?? loadSentArchive(batchId);
  return list.some((e) => e.recordId === recordId);
}
