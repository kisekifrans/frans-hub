"use client";

import { useRef } from "react";
import {
  insertTextAtCursor,
  OUTREACH_TEMPLATE_EMOJIS,
} from "@/lib/audit/outreach/emojis";
import { cn } from "@/lib/utils";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const emojiBtnClass =
  "flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-white/60 dark:hover:bg-white/15";

interface OutreachTemplateEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function OutreachTemplateEditor({
  label,
  value,
  onChange,
  onBlur,
  disabled,
}: OutreachTemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const { value: next, cursor } = insertTextAtCursor(
      value,
      emoji,
      start,
      end,
    );
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
        {label}
      </p>
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/40 bg-white/20 p-2 dark:border-white/10 dark:bg-white/5">
        <span className="w-full px-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          Insert emoji
        </span>
        {OUTREACH_TEMPLATE_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={cn(emojiBtnClass, disabled && "pointer-events-none opacity-40")}
            title={`Insert ${emoji}`}
            onClick={() => insertEmoji(emoji)}
            disabled={disabled}
          >
            {emoji}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className={cn(inputClass, "min-h-[140px] font-mono text-xs")}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}
