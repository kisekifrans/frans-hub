export type GameScreen = "landing" | "playing" | "victory" | "defeat";

export type Difficulty = "easy" | "medium" | "hard" | "extreme";

export type BossAnimState = "idle" | "attack" | "hurt" | "death";

export interface DamagePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  crit?: boolean;
  heal?: boolean;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  maxCombo: number;
}
