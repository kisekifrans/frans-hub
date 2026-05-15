import type { TypingSessionResult, TypingStatsStore } from "./types";

const STORAGE_KEY = "frans-hub-typing-stats";
const SOUND_KEY = "frans-hub-typing-sound";

export const DEFAULT_TYPING_STATS: TypingStatsStore = {
  results: [],
  bestWpm: 0,
  bestAccuracy: 0,
  streak: 0,
  lastPlayedDate: null,
};

const EMPTY = DEFAULT_TYPING_STATS;

export function loadTypingStats(): TypingStatsStore {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as TypingStatsStore;
    return {
      ...EMPTY,
      ...parsed,
      results: parsed.results ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function saveTypingResult(result: TypingSessionResult): TypingStatsStore {
  const prev = loadTypingStats();
  const today = todayKey();
  const last = prev.lastPlayedDate;
  let streak = prev.streak;
  if (!last) streak = 1;
  else if (last === today) streak = prev.streak;
  else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    streak = last === yKey ? prev.streak + 1 : 1;
  }

  const results = [result, ...prev.results].slice(0, 100);
  const next: TypingStatsStore = {
    results,
    bestWpm: Math.max(prev.bestWpm, result.wpm),
    bestAccuracy: Math.max(prev.bestAccuracy, result.accuracy),
    streak,
    lastPlayedDate: today,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function loadSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SOUND_KEY) === "1";
}

export function saveSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
}

export function getTodayStats(results: TypingSessionResult[]) {
  const today = todayKey();
  const list = results.filter(
    (r) => new Date(r.timestamp).toISOString().slice(0, 10) === today,
  );
  const avgWpm =
    list.length > 0
      ? Math.round(list.reduce((s, r) => s + r.wpm, 0) / list.length)
      : 0;
  const avgAcc =
    list.length > 0
      ? Math.round(list.reduce((s, r) => s + r.accuracy, 0) / list.length)
      : 0;
  return { count: list.length, avgWpm, avgAcc };
}

export function getWeeklyWpm(results: TypingSessionResult[]) {
  const days: { day: string; wpm: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const dayResults = results.filter(
      (r) => new Date(r.timestamp).toISOString().slice(0, 10) === key,
    );
    const wpm =
      dayResults.length > 0
        ? Math.round(dayResults.reduce((s, r) => s + r.wpm, 0) / dayResults.length)
        : 0;
    days.push({ day: label, wpm });
  }
  return days;
}
