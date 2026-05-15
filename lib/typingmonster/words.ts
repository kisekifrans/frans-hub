import type { Difficulty } from "./types";
import { DIFFICULTY_CONFIG } from "./boss-config";

const EASY_WORDS = [
  "fire", "soul", "dark", "fury", "blade", "storm", "power", "strike",
  "magic", "demon", "flame", "shadow", "quest", "hero", "fight", "guard",
  "swift", "brave", "focus", "type", "word", "combo", "crit", "boss",
  "slash", "spark", "pulse", "rage", "void", "star", "moon", "rose",
];

const MEDIUM_WORDS = [
  ...EASY_WORDS,
  "phantom", "crimson", "fortress", "lightning", "champion", "guardian",
  "mystic", "dragon", "battle", "warrior", "ancient", "vengeance",
  "triumph", "destiny", "harmony", "crystal", "ember", "frost", "nova",
];

const HARD_WORDS = [
  ...MEDIUM_WORDS,
  "oblivion", "seraphim", "cataclysm", "nightfall", "bloodlust",
  "arcane", "specter", "dominion", "revenant", "apocalypse",
  "phoenix", "tempest", "eclipse", "sanctuary", "betrayal",
];

const EXTREME_WORDS = [
  ...HARD_WORDS,
  "antidisestablishment", "phantasmagoria", "uncharacteristically",
  "incomprehensibilities", "pneumonoultramicroscopicsilicovolcanoconiosis",
  "psychoneuroendocrinological", "counterrevolutionaries", "deinstitutionalization",
];

const PUNCT = ["!", "?", ".", ",", ";", ":", "-", "'", '"'];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickPool(difficulty: Difficulty): string[] {
  switch (difficulty) {
    case "easy":
      return EASY_WORDS;
    case "medium":
      return MEDIUM_WORDS;
    case "hard":
      return HARD_WORDS;
    case "extreme":
      return EXTREME_WORDS;
  }
}

function maybePunctuate(word: string, chance: number): string {
  if (Math.random() > chance) return word;
  const p = PUNCT[Math.floor(Math.random() * PUNCT.length)]!;
  return Math.random() > 0.5 ? `${word}${p}` : `${p}${word}`;
}

export function generateWordBatch(
  difficulty: Difficulty,
  count = 40,
): string[] {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const pool = shuffle(pickPool(difficulty));
  const words: string[] = [];
  let i = 0;
  while (words.length < count) {
    const raw = pool[i % pool.length]!;
    const lenOk =
      raw.length >= cfg.wordLength[0] && raw.length <= cfg.wordLength[1];
    if (lenOk || difficulty === "extreme") {
      words.push(maybePunctuate(raw, cfg.punctuationChance));
    }
    i += 1;
    if (i > count * 8) break;
  }
  while (words.length < count) {
    words.push(maybePunctuate(pool[words.length % pool.length]!, cfg.punctuationChance));
  }
  return words;
}

export const SPECIAL_WORDS = [
  "CRITICAL",
  "OBLITERATE",
  "DEVASTATE",
  "ANNIHILATE",
  "DOMINATE",
  "SHATTER",
  "OBLIVION",
  "EXECUTE",
];

export function pickSpecialWord(): string {
  return SPECIAL_WORDS[Math.floor(Math.random() * SPECIAL_WORDS.length)]!;
}
