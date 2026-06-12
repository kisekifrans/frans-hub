import type { TimelineEvent, TimelineEventType } from "./types";

const STORAGE_KEY = "qa-review-stats-timeline-events";

const listeners = new Set<() => void>();
let cache: TimelineEvent[] | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export function loadTimelineEvents(): TimelineEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TimelineEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTimelineEvents(events: TimelineEvent[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function getSnapshot(): TimelineEvent[] {
  if (cache === null) {
    cache = loadTimelineEvents();
  }
  return cache;
}

function getServerSnapshot(): TimelineEvent[] {
  return [];
}

export function subscribeTimelineEvents(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTimelineEventsSnapshot(): TimelineEvent[] {
  return getSnapshot();
}

export function getTimelineEventsServerSnapshot(): TimelineEvent[] {
  return getServerSnapshot();
}

function writeTimelineEvents(events: TimelineEvent[]) {
  cache = events;
  saveTimelineEvents(events);
  emit();
}

export function createTimelineEvent(input: {
  date: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  durationMinutes?: number;
}): TimelineEvent {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

export function addTimelineEvent(input: {
  date: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  durationMinutes?: number;
}): TimelineEvent[] {
  const next = [...getSnapshot(), createTimelineEvent(input)].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  writeTimelineEvents(next);
  return next;
}

export function updateTimelineEvent(
  id: string,
  patch: Partial<Omit<TimelineEvent, "id" | "createdAt">>,
): TimelineEvent[] {
  const next = getSnapshot()
    .map((e) => (e.id === id ? { ...e, ...patch } : e))
    .sort((a, b) => a.date.localeCompare(b.date));
  writeTimelineEvents(next);
  return next;
}

export function deleteTimelineEvent(id: string): TimelineEvent[] {
  const next = getSnapshot().filter((e) => e.id !== id);
  writeTimelineEvents(next);
  return next;
}
