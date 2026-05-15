"use client";

import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  tokenizeTypingText,
  type TextToken,
} from "@/lib/typing/text-tokens";
import type { TypingPhase } from "@/lib/typing/types";
import { cn } from "@/lib/utils";

const SCROLL_EASE = [0.22, 1, 0.36, 1] as const;
const ACTIVE_LINE_OFFSET = 1;

interface TypingTextDisplayProps {
  text: string;
  cursor: number;
  mistakes: ReadonlySet<number>;
  phase: TypingPhase;
  resetTick: number;
}

function CharSpan({
  char,
  index,
  cursor,
  mistakes,
  setCaretRef,
}: {
  char: string;
  index: number;
  cursor: number;
  mistakes: ReadonlySet<number>;
  setCaretRef: (el: HTMLSpanElement | null) => void;
}) {
  const done = index < cursor;
  const current = index === cursor;
  const wrong = mistakes.has(index);

  return (
    <motion.span
      ref={current ? setCaretRef : undefined}
      layout={current}
      transition={{ type: "spring", stiffness: 620, damping: 38 }}
      className={cn(
        "relative inline transition-colors duration-75",
        wrong && "text-rose-500 dark:text-rose-400",
        done && !wrong && "text-zinc-400 dark:text-zinc-500",
        current &&
          !wrong &&
          "typing-caret rounded-[0.12em] bg-violet-500/30 text-zinc-900 dark:text-white",
        !done && !current && !wrong && "text-zinc-700 dark:text-zinc-300",
        current &&
          wrong &&
          "typing-caret-wrong rounded-[0.12em] bg-rose-500/25 text-rose-600 dark:text-rose-300",
      )}
    >
      {char === " " ? "\u00a0" : char}
      {current ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-violet-500 dark:bg-violet-400"
          layoutId="typing-caret-bar"
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.12, ease: SCROLL_EASE }}
        />
      ) : null}
    </motion.span>
  );
}

function TypingTextDisplayInner({
  text,
  cursor,
  mistakes,
  phase,
  resetTick,
}: TypingTextDisplayProps) {
  const tokens = useMemo(() => tokenizeTypingText(text), [text]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const rafRef = useRef<number | null>(null);

  const setCaretRef = (el: HTMLSpanElement | null) => {
    caretRef.current = el;
  };

  useLayoutEffect(() => {
    const run = () => {
      const viewport = viewportRef.current;
      const caret = caretRef.current;
      const content = contentRef.current;
      if (!viewport || !content) return;

      if (!caret) {
        setOffsetY(0);
        return;
      }

      const styles = getComputedStyle(viewport);
      const lineHeight =
        parseFloat(styles.lineHeight) ||
        parseFloat(styles.fontSize) * 1.625 ||
        28;
      const caretTop = caret.offsetTop;
      const target = Math.max(0, caretTop - lineHeight * ACTIVE_LINE_OFFSET);
      const maxScroll = Math.max(
        0,
        content.scrollHeight - viewport.clientHeight,
      );
      setOffsetY(-Math.min(target, maxScroll));
    };

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [cursor, text, tokens, phase, resetTick]);

  return (
    <motion.div
      key={resetTick}
      ref={viewportRef}
      className="relative h-[8.5rem] w-full overflow-hidden sm:h-[9.75rem] md:h-[10.5rem]"
      initial={{ opacity: 0.5, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: SCROLL_EASE }}
      aria-live="polite"
      aria-atomic="false"
    >
      <motion.div
        ref={contentRef}
        className="will-change-transform"
        animate={{ y: offsetY }}
        transition={{ duration: 0.18, ease: SCROLL_EASE }}
      >
        <motion.div
          className="flex w-full min-w-0 flex-wrap items-baseline gap-x-[0.2em] gap-y-1 font-mono text-lg leading-relaxed tracking-wide sm:text-xl md:text-2xl"
          initial={false}
          animate={{ opacity: phase === "finished" ? 0.88 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {tokens.map((token, ti) => (
            <TokenBlock
              key={`${token.kind}-${token.start}-${ti}`}
              token={token}
              cursor={cursor}
              mistakes={mistakes}
              setCaretRef={setCaretRef}
            />
          ))}
          {cursor >= text.length && text.length > 0 ? (
            <span
              ref={setCaretRef}
              className="inline-block h-[1em] w-0 align-baseline"
              aria-hidden
            />
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function TokenBlock({
  token,
  cursor,
  mistakes,
  setCaretRef,
}: {
  token: TextToken;
  cursor: number;
  mistakes: ReadonlySet<number>;
  setCaretRef: (el: HTMLSpanElement | null) => void;
}) {
  if (token.kind === "break") {
    return <span className="h-0 w-full basis-full" aria-hidden />;
  }

  if (token.kind === "space") {
    return (
      <span className="inline-block whitespace-pre">
        <CharSpan
          char=" "
          index={token.start}
          cursor={cursor}
          mistakes={mistakes}
          setCaretRef={setCaretRef}
        />
      </span>
    );
  }

  const wordDone = cursor > token.start + token.content.length;
  const wordActive =
    cursor >= token.start && cursor <= token.start + token.content.length;

  return (
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className={cn(
        "inline-block whitespace-pre rounded-[0.15em] transition-[opacity,background-color] duration-150",
        wordDone && "opacity-65",
        wordActive &&
          "bg-violet-500/12 px-[0.14em] -mx-[0.08em] opacity-100 shadow-[0_0_0_1px_rgba(167,139,250,0.15)]",
      )}
      animate={
        wordActive
          ? { scale: 1.015, y: 0 }
          : { scale: 1, y: 0 }
      }
    >
      {token.content.split("").map((char, j) => (
        <CharSpan
          key={token.start + j}
          char={char}
          index={token.start + j}
          cursor={cursor}
          mistakes={mistakes}
          setCaretRef={setCaretRef}
        />
      ))}
    </motion.span>
  );
}

export const TypingTextDisplay = memo(TypingTextDisplayInner);
