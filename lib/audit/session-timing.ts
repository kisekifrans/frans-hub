const STORAGE_KEY = "frans-hub-audit-session-timing";

export interface SessionTimingRecord {
  sessionId: string;
  accumulatedMs: number;
  activeSince: number | null;
  lastOpenedAt: string;
}

export interface SessionTimingMetrics {
  elapsedMs: number;
  elapsedLabel: string;
  reviewedCount: number;
  totalRows: number;
  rowsPerHourLabel: string;
  etaLabel: string | null;
}

type TimingStore = Record<string, SessionTimingRecord>;

function readStore(): TimingStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TimingStore;
  } catch {
    return {};
  }
}

function writeStore(store: TimingStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadSessionTiming(sessionId: string): SessionTimingRecord {
  const store = readStore();
  const existing = store[sessionId];
  if (existing) return { ...existing };
  return {
    sessionId,
    accumulatedMs: 0,
    activeSince: null,
    lastOpenedAt: new Date().toISOString(),
  };
}

export function saveSessionTiming(record: SessionTimingRecord) {
  const store = readStore();
  store[record.sessionId] = record;
  writeStore(store);
}

export function deleteSessionTiming(sessionId: string) {
  const store = readStore();
  delete store[sessionId];
  writeStore(store);
}

export function getElapsedMs(record: SessionTimingRecord, now = Date.now()): number {
  let ms = record.accumulatedMs;
  if (record.activeSince) {
    ms += now - record.activeSince;
  }
  return ms;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return "0m";
  const totalMins = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${Math.max(1, totalMins)}m`;
}

export function formatRowsPerHour(reviewed: number, elapsedMs: number): string {
  if (reviewed <= 0 || elapsedMs < 30000) return "—";
  const perHour = reviewed / (elapsedMs / 3_600_000);
  if (!Number.isFinite(perHour) || perHour <= 0) return "—";
  return `${Math.round(perHour)} rows/hour`;
}

export function formatEta(
  reviewed: number,
  total: number,
  elapsedMs: number,
): string | null {
  if (reviewed <= 0 || reviewed >= total || elapsedMs < 1000) return null;
  const remaining = total - reviewed;
  const msPerRow = elapsedMs / reviewed;
  const etaMs = remaining * msPerRow;
  if (!Number.isFinite(etaMs) || etaMs <= 0) return null;
  return `ETA ${formatDuration(etaMs)}`;
}

export function buildTimingMetrics(
  record: SessionTimingRecord,
  reviewedCount: number,
  totalRows: number,
  now = Date.now(),
): SessionTimingMetrics {
  const elapsedMs = getElapsedMs(record, now);
  return {
    elapsedMs,
    elapsedLabel: formatDuration(elapsedMs),
    reviewedCount,
    totalRows,
    rowsPerHourLabel: formatRowsPerHour(reviewedCount, elapsedMs),
    etaLabel: formatEta(reviewedCount, totalRows, elapsedMs),
  };
}

export function getStoredTimingMetrics(
  sessionId: string,
  reviewedCount: number,
  totalRows: number,
): SessionTimingMetrics {
  const record = loadSessionTiming(sessionId);
  return buildTimingMetrics(record, reviewedCount, totalRows);
}

export function formatLastOpened(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
