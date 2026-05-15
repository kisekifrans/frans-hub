"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { charToKeyId } from "@/lib/typing/keyboard-layout";
import { DIFFICULTY_CONFIG } from "@/lib/typingmonster/boss-config";
import {
  generateWordBatch,
  pickSpecialWord,
} from "@/lib/typingmonster/words";
import type {
  BossAnimState,
  DamagePopup,
  Difficulty,
  GameScreen,
  GameStats,
} from "@/lib/typingmonster/types";
import type { KeyState } from "@/lib/typing/types";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useTypingMonsterGame() {
  const [screen, setScreen] = useState<GameScreen>("landing");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [playerMaxHp, setPlayerMaxHp] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [critMeter, setCritMeter] = useState(0);
  const [specialActive, setSpecialActive] = useState(false);
  const [specialWord, setSpecialWord] = useState("");
  const [mistakes, setMistakes] = useState<Set<number>>(() => new Set());
  const [pressedKeys, setPressedKeys] = useState<Record<string, KeyState>>({});
  const [bossAnim, setBossAnim] = useState<BossAnimState>("idle");
  const [shake, setShake] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [popups, setPopups] = useState<DamagePopup[]>([]);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [stats, setStats] = useState<GameStats>({
    wpm: 0,
    accuracy: 100,
    maxCombo: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef(screen);
  const bossAnimRef = useRef(bossAnim);
  const wordsRef = useRef(words);
  const wordIndexRef = useRef(wordIndex);
  const charIndexRef = useRef(charIndex);
  const comboRef = useRef(combo);
  const specialRef = useRef(specialActive);
  const targetTextRef = useRef("");

  screenRef.current = screen;
  targetTextRef.current = specialActive ? specialWord : (words[wordIndex] ?? "");
  bossAnimRef.current = bossAnim;
  wordsRef.current = words;
  wordIndexRef.current = wordIndex;
  charIndexRef.current = charIndex;
  comboRef.current = combo;
  specialRef.current = specialActive;

  const currentWord = words[wordIndex] ?? "";
  const targetText = specialActive ? specialWord : currentWord;

  const spawnPopup = useCallback(
    (text: string, crit = false, heal = false) => {
      const id = uid();
      setPopups((p) => [
        ...p.slice(-8),
        {
          id,
          text,
          x: 42 + Math.random() * 16,
          y: 28 + Math.random() * 12,
          crit,
          heal,
        },
      ]);
      window.setTimeout(() => {
        setPopups((p) => p.filter((x) => x.id !== id));
      }, 900);
    },
    [],
  );

  const pulseBossAnim = useCallback((state: BossAnimState, holdMs = 420) => {
    if (state === bossAnimRef.current) return;
    setBossAnim(state);
    if (state !== "idle" && state !== "death") {
      window.setTimeout(() => {
        if (bossAnimRef.current === state) setBossAnim("idle");
      }, holdMs);
    }
  }, []);

  const startGame = useCallback(
    (diff: Difficulty) => {
      const cfg = DIFFICULTY_CONFIG[diff];
      setDifficulty(diff);
      setBossMaxHp(cfg.bossMaxHp);
      setBossHp(cfg.bossMaxHp);
      setPlayerMaxHp(cfg.playerMaxHp);
      setPlayerHp(cfg.playerMaxHp);
      setWords(generateWordBatch(diff, 64));
      setWordIndex(0);
      setCharIndex(0);
      setCombo(0);
      comboRef.current = 0;
      setMaxCombo(0);
      setCritMeter(0);
      setSpecialActive(false);
      setSpecialWord("");
      setMistakes(new Set());
      setPressedKeys({});
      setBossAnim("idle");
      setPopups([]);
      setCorrectChars(0);
      setTotalKeystrokes(0);
      setStartedAt(Date.now());
      setScreen("playing");
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    },
    [],
  );

  const newRun = useCallback(() => {
    startGame(difficulty);
  }, [difficulty, startGame]);

  const endVictory = useCallback(() => {
    setBossAnim("death");
    setScreen("victory");
  }, []);

  const endDefeat = useCallback(() => {
    setBossAnim("death");
    setScreen("defeat");
  }, []);

  const advanceWord = useCallback(() => {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    const nextCombo = comboRef.current;
    if (
      !specialRef.current &&
      nextCombo > 0 &&
      nextCombo % cfg.comboSpecialInterval === 0
    ) {
      setSpecialActive(true);
      setSpecialWord(pickSpecialWord());
      setCharIndex(0);
      setMistakes(new Set());
      return;
    }

    setSpecialActive(false);
    setSpecialWord("");
    const nextWord = wordIndexRef.current + 1;
    if (nextWord >= wordsRef.current.length) {
      setWords((w) => [...w, ...generateWordBatch(difficulty, 32)]);
    }
    setWordIndex((i) => i + 1);
    setCharIndex(0);
    setMistakes(new Set());
  }, [difficulty]);

  const dealBossDamage = useCallback(
    (amount: number, crit = false) => {
      setBossHp((hp) => {
        const next = Math.max(0, hp - amount);
        if (next <= 0) {
          window.setTimeout(endVictory, 600);
        }
        return next;
      });
      spawnPopup(crit ? `${amount} CRIT!` : `${amount}`, crit);
      if (crit) pulseBossAnim("hurt", 520);
      setHitFlash(true);
      window.setTimeout(() => setHitFlash(false), 200);
      if (crit) {
        setShake((s) => s + 1);
      }
    },
    [endVictory, pulseBossAnim, spawnPopup],
  );

  const hurtPlayer = useCallback(
    (amount: number, bossAttacks = true) => {
      setPlayerHp((hp) => {
        const next = Math.max(0, hp - amount);
        if (next <= 0) {
          window.setTimeout(endDefeat, 500);
        }
        return next;
      });
      spawnPopup(`-${amount}`, false, false);
      if (bossAttacks) pulseBossAnim("attack", 480);
      setShake((s) => s + 1);
    },
    [endDefeat, pulseBossAnim, spawnPopup],
  );

  const onCorrectChar = useCallback(() => {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    const nextCombo = comboRef.current + 1;
    setCombo(nextCombo);
    comboRef.current = nextCombo;
    setMaxCombo((m) => Math.max(m, nextCombo));
    setCorrectChars((c) => c + 1);
    setCritMeter((m) =>
      Math.min(100, m + cfg.critMeterPerChar),
    );

    const critReady =
      critMeter >= cfg.critMeterThreshold ||
      (cfg.critComboInterval > 0 && nextCombo % cfg.critComboInterval === 0);
    const dmg = Math.round(
      cfg.baseDamage *
        (1 + nextCombo * cfg.comboDamageScale) *
        (critReady ? cfg.critMultiplier : 1),
    );
    dealBossDamage(dmg, critReady);

    const nextChar = charIndexRef.current + 1;
    setCharIndex(nextChar);
    charIndexRef.current = nextChar;

    if (nextChar >= targetTextRef.current.length) {
      if (specialRef.current) {
        dealBossDamage(
          Math.round(
            cfg.baseDamage * cfg.critMultiplier * cfg.specialWordBonusMult,
          ),
          true,
        );
        setShake((s) => s + 1);
        setCritMeter(0);
      }
      advanceWord();
    }
  }, [advanceWord, critMeter, dealBossDamage, difficulty]);

  const onWrongChar = useCallback(() => {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    setCombo(0);
    comboRef.current = 0;
    setCritMeter(0);
    setMistakes((m) => new Set(m).add(charIndexRef.current));
    hurtPlayer(cfg.typoPlayerDamage, true);

    const nextChar = charIndexRef.current + 1;
    setCharIndex(nextChar);
    charIndexRef.current = nextChar;
    if (nextChar >= targetTextRef.current.length) advanceWord();
  }, [advanceWord, difficulty, hurtPlayer]);

  const processKey = useCallback(
    (char: string) => {
      if (screenRef.current !== "playing" || bossAnimRef.current === "death")
        return;

      const expected = targetTextRef.current[charIndexRef.current];
      if (expected === undefined) return;

      setTotalKeystrokes((t) => t + 1);
      const keyId = charToKeyId(char) ?? char;

      if (char === expected) {
        setPressedKeys((p) => ({ ...p, [keyId]: "correct" }));
        onCorrectChar();
      } else {
        setPressedKeys((p) => ({ ...p, [keyId]: "wrong" }));
        onWrongChar();
      }

      window.setTimeout(() => {
        setPressedKeys((p) => {
          const next = { ...p };
          delete next[keyId];
          return next;
        });
      }, 90);
    },
    [onCorrectChar, onWrongChar, targetText],
  );

  useEffect(() => {
    if (screen !== "playing" || !startedAt) return;
    const id = window.setInterval(() => {
      const ms = Date.now() - startedAt;
      const min = ms / 60000;
      const wpm = min > 0 ? Math.round(correctChars / 5 / min) : 0;
      const acc =
        totalKeystrokes > 0
          ? Math.round((correctChars / totalKeystrokes) * 100)
          : 100;
      setStats({ wpm, accuracy: acc, maxCombo });
    }, 200);
    return () => clearInterval(id);
  }, [screen, startedAt, correctChars, totalKeystrokes, maxCombo]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Tab") {
        e.preventDefault();
        if (screenRef.current === "landing") return;
        newRun();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (screenRef.current === "landing") return;
        startGame(difficulty);
        return;
      }

      if (screenRef.current === "victory" || screenRef.current === "defeat") {
        if (e.key === "Enter") {
          e.preventDefault();
          newRun();
        }
        return;
      }

      if (screenRef.current !== "playing") return;

      if (e.key === "Backspace") {
        e.preventDefault();
        return;
      }

      if (e.key.length !== 1 && e.key !== " ") return;
      e.preventDefault();
      processKey(e.key === " " ? " " : e.key);
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [difficulty, newRun, processKey, startGame]);

  const expectedChar = targetText[charIndex] ?? "";
  const expectedKeyId = charToKeyId(expectedChar);

  useEffect(() => {
    if (screen !== "playing" || !expectedKeyId) return;
    setPressedKeys((p) => ({ ...p, [expectedKeyId]: "expected" }));
    return () => {
      setPressedKeys((p) => {
        const next = { ...p };
        if (next[expectedKeyId] === "expected") delete next[expectedKeyId];
        return next;
      });
    };
  }, [expectedKeyId, screen, charIndex, targetText]);

  return {
    screen,
    difficulty,
    setDifficulty,
    startGame,
    newRun,
    bossHp,
    bossMaxHp,
    playerHp,
    playerMaxHp,
    targetText,
    charIndex,
    mistakes,
    combo,
    critMeter,
    specialActive,
    bossAnim,
    shake,
    hitFlash,
    popups,
    pressedKeys,
    stats,
    inputRef,
    currentWord,
    wordIndex,
  };
}
