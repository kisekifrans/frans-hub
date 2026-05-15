"use client";

import { memo } from "react";
import { TypingInput } from "@/components/typing/TypingInput";
import { TypingStats } from "@/components/typing/TypingStats";

import type { TypingPhase } from "@/lib/typing/types";

interface TypingEngineProps {
  text: string;
  cursor: number;
  mistakes: ReadonlySet<number>;
  shake: boolean;
  phase: TypingPhase;
  wpm: number;
  accuracy: number;
  errors: number;
  timeLeftMs: number | null;
  elapsedMs: number;
  resetTick: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onMobileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
}

function TypingEngineInner(props: TypingEngineProps) {
  return (
    <div className="space-y-4">
      <TypingStats
        wpm={props.wpm}
        accuracy={props.accuracy}
        errors={props.errors}
        timeLeftMs={props.timeLeftMs}
        elapsedMs={props.elapsedMs}
      />
      <TypingInput
        text={props.text}
        cursor={props.cursor}
        mistakes={props.mistakes}
        shake={props.shake}
        phase={props.phase}
        resetTick={props.resetTick}
        inputRef={props.inputRef}
        onMobileInput={props.onMobileInput}
        onFocusAreaClick={props.onFocus}
      />
    </div>
  );
}

export const TypingEngine = memo(TypingEngineInner);
