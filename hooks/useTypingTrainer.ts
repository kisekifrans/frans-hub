"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { charToKeyId } from "@/lib/typing/keyboard-layout";
import {
  generateTypingText,
  timeLimitMs,
  wordTargetFromTimer,
} from "@/lib/typing/content";
import { calcAccuracy, calcWpm } from "@/lib/typing/metrics";
import { playErrorClick, playKeyClick } from "@/lib/typing/sound";
import {
  DEFAULT_TYPING_STATS,
  loadSoundEnabled,
  loadTypingStats,
  saveSoundEnabled,
  saveTypingResult,
} from "@/lib/typing/storage";
import type {
  KeyState,
  TimerMode,
  TypingMode,
  TypingPhase,
  TypingSessionResult,
  TypingStatsStore,
  WpmSnapshot,
} from "@/lib/typing/types";

function generateId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function applySessionReset(
  content: string,
  refs: {
    textRef: React.MutableRefObject<string>;
    cursorRef: React.MutableRefObject<number>;
    correctRef: React.MutableRefObject<number>;
    totalRef: React.MutableRefObject<number>;
    phaseRef: React.MutableRefObject<TypingPhase>;
  },
  setters: {
    setText: (v: string) => void;
    setCursor: (v: number) => void;
    setErrors: (v: number) => void;
    setCorrectChars: (v: number) => void;
    setTotalKeystrokes: (v: number) => void;
    setStartedAt: (v: number | null) => void;
    setElapsedMs: (v: number) => void;
    setPressedKeys: (v: Record<string, KeyState>) => void;
    setWpmHistory: (v: WpmSnapshot[]) => void;
    setPhase: (v: TypingPhase) => void;
    setLastResult: (v: TypingSessionResult | null) => void;
    setMistakes: (v: Set<number>) => void;
  },
) {
  refs.textRef.current = content;
  setters.setText(content);
  refs.cursorRef.current = 0;
  setters.setCursor(0);
  setters.setErrors(0);
  setters.setCorrectChars(0);
  refs.correctRef.current = 0;
  setters.setTotalKeystrokes(0);
  refs.totalRef.current = 0;
  setters.setStartedAt(null);
  setters.setElapsedMs(0);
  setters.setPressedKeys({});
  setters.setWpmHistory([]);
  setters.setPhase("idle");
  setters.setLastResult(null);
  setters.setMistakes(new Set());
  refs.phaseRef.current = "idle";
}

function applyInputClear(
  refs: {
    cursorRef: React.MutableRefObject<number>;
    correctRef: React.MutableRefObject<number>;
    totalRef: React.MutableRefObject<number>;
    phaseRef: React.MutableRefObject<TypingPhase>;
  },
  setters: {
    setCursor: (v: number) => void;
    setErrors: (v: number) => void;
    setCorrectChars: (v: number) => void;
    setTotalKeystrokes: (v: number) => void;
    setStartedAt: (v: number | null) => void;
    setElapsedMs: (v: number) => void;
    setPressedKeys: (v: Record<string, KeyState>) => void;
    setWpmHistory: (v: WpmSnapshot[]) => void;
    setPhase: (v: TypingPhase) => void;
    setLastResult: (v: TypingSessionResult | null) => void;
    setMistakes: (v: Set<number>) => void;
  },
) {
  refs.cursorRef.current = 0;
  setters.setCursor(0);
  setters.setErrors(0);
  setters.setCorrectChars(0);
  refs.correctRef.current = 0;
  setters.setTotalKeystrokes(0);
  refs.totalRef.current = 0;
  setters.setStartedAt(null);
  setters.setElapsedMs(0);
  setters.setPressedKeys({});
  setters.setWpmHistory([]);
  setters.setMistakes(new Set());
  setters.setLastResult(null);
  setters.setPhase("idle");
  refs.phaseRef.current = "idle";
}

export function useTypingTrainer() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<TypingMode>("words");
  const [timer, setTimer] = useState<TimerMode>(30);
  const [phase, setPhase] = useState<TypingPhase>("idle");
  const [text, setText] = useState("");
  const [cursor, setCursor] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Record<string, KeyState>>({});
  const [shake, setShake] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [stats, setStats] = useState<TypingStatsStore>(DEFAULT_TYPING_STATS);
  const [lastResult, setLastResult] = useState<TypingSessionResult | null>(null);
  const [wpmHistory, setWpmHistory] = useState<WpmSnapshot[]>([]);
  const [mistakes, setMistakes] = useState<Set<number>>(() => new Set());
  const [resetTick, setResetTick] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const phaseRef = useRef(phase);
  const cursorRef = useRef(0);
  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const textRef = useRef("");
  const skipModeTimerReset = useRef(true);
  const shakeTimerRef = useRef<number | null>(null);
  const keyFlashTimerRef = useRef<number | null>(null);

  phaseRef.current = phase;
  textRef.current = text;
  cursorRef.current = cursor;

  const setters = useMemo(
    () => ({
      setText,
      setCursor,
      setErrors,
      setCorrectChars,
      setTotalKeystrokes,
      setStartedAt,
      setElapsedMs,
      setPressedKeys,
      setWpmHistory,
      setPhase,
      setLastResult,
      setMistakes,
    }),
    [],
  );

  const refs = useMemo(
    () => ({
      textRef,
      cursorRef,
      correctRef,
      totalRef,
      phaseRef,
    }),
    [],
  );

  const clearRefs = useMemo(
    () => ({
      cursorRef,
      correctRef,
      totalRef,
      phaseRef,
    }),
    [],
  );

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const restartTest = useCallback(() => {
    const content = generateTypingText(mode, wordTargetFromTimer(timer));
    applySessionReset(content, refs, setters);
    setResetTick((n) => n + 1);
    focusInput();
  }, [mode, timer, refs, setters, focusInput]);

  const clearInput = useCallback(() => {
    applyInputClear(clearRefs, setters);
    focusInput();
  }, [clearRefs, setters, focusInput]);

  useEffect(() => {
    setSoundOn(loadSoundEnabled());
    setStats(loadTypingStats());
    const content = generateTypingText("words", wordTargetFromTimer(30));
    applySessionReset(content, refs, setters);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once on mount
  }, []);

  useEffect(() => {
    if (!ready) return;
    focusInput();
  }, [ready, focusInput]);

  useEffect(() => {
    if (!ready) return;
    if (skipModeTimerReset.current) {
      skipModeTimerReset.current = false;
      return;
    }
    const content = generateTypingText(mode, wordTargetFromTimer(timer));
    applySessionReset(content, refs, setters);
    setResetTick((n) => n + 1);
    focusInput();
  }, [mode, timer, ready, refs, setters, focusInput]);

  const expectedChar = text[cursor] ?? "";
  const expectedKeyId = useMemo(
    () => (ready ? charToKeyId(expectedChar) : null),
    [expectedChar, ready],
  );

  const finish = useCallback(() => {
    if (phaseRef.current === "finished") return;
    const duration = startedAt ? Date.now() - startedAt : elapsedMs || 1;
    const wpm = calcWpm(correctRef.current, duration);
    const accuracy = calcAccuracy(correctRef.current, totalRef.current);
    const result: TypingSessionResult = {
      id: generateId(),
      mode,
      timer,
      wpm,
      accuracy,
      correctChars: correctRef.current,
      totalChars: textRef.current.length,
      durationMs: duration,
      timestamp: Date.now(),
    };
    setLastResult(result);
    setStats(saveTypingResult(result));
    setPhase("finished");
    phaseRef.current = "finished";
    setPressedKeys({});
  }, [startedAt, elapsedMs, mode, timer]);

  const timeLeftMs = useMemo(() => {
    const limit = timeLimitMs(timer);
    if (!limit || !startedAt) return limit;
    return Math.max(0, limit - elapsedMs);
  }, [timer, startedAt, elapsedMs]);

  useEffect(() => {
    if (!ready || phase !== "running" || !startedAt) return;
    const id = window.setInterval(() => {
      const ms = Date.now() - startedAt;
      setElapsedMs(ms);
      const wpm = calcWpm(correctRef.current, ms);
      setWpmHistory((prev) => {
        const sec = Math.floor(ms / 1000);
        if (prev.length > 0 && prev[prev.length - 1]?.second === sec) {
          const copy = [...prev];
          copy[copy.length - 1] = { second: sec, wpm };
          return copy;
        }
        return [...prev, { second: sec, wpm }].slice(-120);
      });
      const limit = timeLimitMs(timer);
      if (limit && ms >= limit) finish();
    }, 100);
    return () => clearInterval(id);
  }, [ready, phase, startedAt, timer, finish]);

  useEffect(() => {
    if (
      ready &&
      phase === "running" &&
      cursor >= text.length &&
      text.length > 0
    ) {
      finish();
    }
  }, [ready, cursor, text.length, phase, finish]);

  const processChar = useCallback(
    (char: string) => {
      if (!ready || phaseRef.current === "finished") return;

      if (phaseRef.current === "idle") {
        setPhase("running");
        phaseRef.current = "running";
        setStartedAt(Date.now());
      }

      const idx = cursorRef.current;
      const expected = textRef.current[idx];
      if (expected === undefined) return;

      const keyId = charToKeyId(char) ?? char;
      const isCorrect = char === expected;

      totalRef.current += 1;
      setTotalKeystrokes(totalRef.current);

      if (isCorrect) {
        correctRef.current += 1;
        setCorrectChars(correctRef.current);
        playKeyClick(soundOn);
        setPressedKeys((p) => ({ ...p, [keyId]: "correct" }));
      } else {
        setErrors((e) => e + 1);
        setMistakes((prev) => new Set(prev).add(idx));
        playErrorClick(soundOn);
        setShake(true);
        if (shakeTimerRef.current != null) clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = window.setTimeout(() => setShake(false), 280);
        setPressedKeys((p) => ({ ...p, [keyId]: "wrong" }));
      }

      cursorRef.current = idx + 1;
      setCursor(cursorRef.current);

      if (keyFlashTimerRef.current != null) clearTimeout(keyFlashTimerRef.current);
      keyFlashTimerRef.current = window.setTimeout(() => {
        setPressedKeys((p) => {
          const next = { ...p };
          delete next[keyId];
          return next;
        });
      }, 90);
    },
    [ready, soundOn],
  );

  useEffect(() => {
    if (!ready) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Tab") {
        e.preventDefault();
        restartTest();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        clearInput();
        return;
      }

      if (phaseRef.current === "finished") {
        if (e.key === "Enter") {
          e.preventDefault();
          restartTest();
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        if (cursorRef.current > 0 && phaseRef.current !== "idle") {
          cursorRef.current -= 1;
          const at = cursorRef.current;
          setMistakes((prev) => {
            if (!prev.has(at)) return prev;
            const next = new Set(prev);
            next.delete(at);
            return next;
          });
          setCursor(at);
        }
        return;
      }

      if (e.key.length !== 1 && e.key !== " ") return;
      e.preventDefault();
      processChar(e.key === " " ? " " : e.key);
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [ready, processChar, restartTest, clearInput]);

  useEffect(() => {
    if (!ready || !expectedKeyId || phase === "finished") return;
    setPressedKeys((p) => ({ ...p, [expectedKeyId]: "expected" }));
    return () => {
      setPressedKeys((p) => {
        const next = { ...p };
        if (next[expectedKeyId] === "expected") delete next[expectedKeyId];
        return next;
      });
    };
  }, [ready, expectedKeyId, phase]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !ready) return;

    const onBlur = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active?.closest("[data-typing-skip-focus]")) return;
        if (phaseRef.current === "finished") return;
        input.focus({ preventScroll: true });
      });
    };

    input.addEventListener("blur", onBlur);
    return () => input.removeEventListener("blur", onBlur);
  }, [ready]);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      saveSoundEnabled(next);
      return next;
    });
  }, []);

  const onMobileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) return;
      const char = val.slice(-1);
      processChar(char);
      e.target.value = "";
    },
    [processChar],
  );

  const liveWpm = calcWpm(correctChars, Math.max(elapsedMs, 1));
  const liveAccuracy = calcAccuracy(correctChars, totalKeystrokes);

  return {
    ready,
    mode,
    setMode,
    timer,
    setTimer,
    phase,
    text,
    cursor,
    mistakes,
    errors,
    correctChars,
    totalKeystrokes,
    elapsedMs,
    timeLeftMs,
    pressedKeys,
    expectedKeyId,
    shake,
    soundOn,
    toggleSound,
    stats,
    lastResult,
    wpmHistory,
    liveWpm,
    liveAccuracy,
    resetTick,
    inputRef,
    resetSession: restartTest,
    restartTest,
    clearInput,
    finish,
    onMobileInput,
    focusInput,
  };
}
