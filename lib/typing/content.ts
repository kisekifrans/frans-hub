import type { TypingMode } from "./types";
import { CODE_SNIPPETS } from "./pools/code";
import { ENGLISH_WORDS } from "./pools/english";
import { INDONESIAN_WORDS } from "./pools/indonesian";
import { QUOTES } from "./pools/quotes";
import {
  pickCodeSnippet,
  pickNumbers,
  pickQuote,
  pickWords,
} from "./word-picker";

const MIXED_WORDS = [...ENGLISH_WORDS] as string[];

function wordsToText(pool: readonly string[], count: number): string {
  return pickWords(pool, count).join(" ");
}

export function generateTypingText(mode: TypingMode, wordTarget = 50): string {
  switch (mode) {
    case "english":
      return wordsToText(ENGLISH_WORDS, wordTarget);
    case "indonesian":
      return wordsToText(INDONESIAN_WORDS, wordTarget);
    case "quotes":
      return pickQuote(QUOTES);
    case "numbers":
      return pickNumbers(wordTarget + 20);
    case "code":
      return pickCodeSnippet(CODE_SNIPPETS);
    case "words":
    default:
      return wordsToText(MIXED_WORDS, wordTarget);
  }
}

export function wordTargetFromTimer(timer: import("./types").TimerMode): number {
  if (timer === "words25") return 25;
  if (timer === "words50") return 50;
  if (timer === "words100") return 100;
  return 50;
}

export function timeLimitMs(timer: import("./types").TimerMode): number | null {
  if (typeof timer === "number") return timer * 1000;
  return null;
}
