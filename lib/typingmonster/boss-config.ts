import type { BossAnimState, Difficulty } from "./types";

export const BOSS_ID = "demonalea";
export const BOSS_NAME = "Demonalea";
export const BOSS_BASE = `/typingmonster/bosses/${BOSS_ID}`;

/** LPC animation names to try, in priority order, per boss state. */
export const BOSS_ANIM_CANDIDATES: Record<BossAnimState, string[]> = {
  idle: ["idle", "walk", "combat_idle", "emote"],
  attack: ["thrust_oversize", "thrust", "slash", "shoot", "spellcast"],
  hurt: ["hurt"],
  death: ["hurt", "sit", "emote"],
};

/** Default frames per animation when sheet metadata is unavailable. */
export const LPC_FRAME_COUNTS: Record<string, number> = {
  idle: 4,
  walk: 9,
  run: 8,
  thrust: 8,
  thrust_oversize: 8,
  hurt: 6,
  slash: 6,
  shoot: 13,
  spellcast: 7,
  sit: 3,
  emote: 3,
  combat_idle: 4,
};

export const LPC_FRAME_SIZE = 64;
export const LPC_DIRECTION_ROW = 2;

export interface DifficultyConfig {
  bossMaxHp: number;
  playerMaxHp: number;
  baseDamage: number;
  /** Extra damage per combo stack (e.g. 0.015 = +1.5% per combo). */
  comboDamageScale: number;
  critMultiplier: number;
  /** Crit when meter reaches this (0–100). */
  critMeterThreshold: number;
  critMeterPerChar: number;
  /** Guaranteed crit every N combo (0 = disabled). */
  critComboInterval: number;
  /** Bonus hit when completing a combo special word. */
  specialWordBonusMult: number;
  typoPlayerDamage: number;
  bossAttackDamage: number;
  comboSpecialInterval: number;
  wordLength: [number, number];
  punctuationChance: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    bossMaxHp: 520,
    playerMaxHp: 120,
    baseDamage: 5,
    comboDamageScale: 0.022,
    critMultiplier: 2.2,
    critMeterThreshold: 100,
    critMeterPerChar: 3,
    critComboInterval: 14,
    specialWordBonusMult: 2.2,
    typoPlayerDamage: 7,
    bossAttackDamage: 10,
    comboSpecialInterval: 18,
    wordLength: [3, 6],
    punctuationChance: 0,
  },
  medium: {
    bossMaxHp: 1200,
    playerMaxHp: 100,
    baseDamage: 4,
    comboDamageScale: 0.018,
    critMultiplier: 2.3,
    critMeterThreshold: 100,
    critMeterPerChar: 2.5,
    critComboInterval: 16,
    specialWordBonusMult: 2.4,
    typoPlayerDamage: 9,
    bossAttackDamage: 14,
    comboSpecialInterval: 18,
    wordLength: [4, 8],
    punctuationChance: 0.08,
  },
  hard: {
    bossMaxHp: 2200,
    playerMaxHp: 90,
    baseDamage: 3,
    comboDamageScale: 0.014,
    critMultiplier: 2.4,
    critMeterThreshold: 100,
    critMeterPerChar: 2,
    critComboInterval: 18,
    specialWordBonusMult: 2.5,
    typoPlayerDamage: 11,
    bossAttackDamage: 16,
    comboSpecialInterval: 20,
    wordLength: [5, 10],
    punctuationChance: 0.35,
  },
  extreme: {
    bossMaxHp: 4200,
    playerMaxHp: 75,
    baseDamage: 2,
    comboDamageScale: 0.01,
    critMultiplier: 2.35,
    critMeterThreshold: 100,
    critMeterPerChar: 1.5,
    critComboInterval: 22,
    specialWordBonusMult: 2.6,
    typoPlayerDamage: 14,
    bossAttackDamage: 20,
    comboSpecialInterval: 22,
    wordLength: [7, 14],
    punctuationChance: 0.2,
  },
};
