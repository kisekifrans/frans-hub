export type TypingMode =
  | "words"
  | "quotes"
  | "numbers"
  | "code"
  | "indonesian"
  | "english";

export type TimerMode = 15 | 30 | 60 | 120 | "words25" | "words50" | "words100";

export type TypingPhase = "idle" | "running" | "finished";

export type KeyState = "idle" | "expected" | "correct" | "wrong";

export interface TypingSessionResult {
  id: string;
  mode: TypingMode;
  timer: TimerMode;
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  durationMs: number;
  timestamp: number;
}

export interface TypingStatsStore {
  results: TypingSessionResult[];
  bestWpm: number;
  bestAccuracy: number;
  streak: number;
  lastPlayedDate: string | null;
}

export interface WpmSnapshot {
  second: number;
  wpm: number;
}
