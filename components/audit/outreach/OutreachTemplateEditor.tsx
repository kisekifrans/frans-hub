"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { EmojiPickerPopover } from "@/components/quickreply/EmojiPickerPopover";
import { insertTextAtCursor } from "@/lib/audit/outreach/emojis";
import { cn } from "@/lib/utils";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

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
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobileSheet(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
          {label}
        </p>
        <div className="relative">
          <button
            ref={emojiBtnRef}
            type="button"
            disabled={disabled}
            aria-label="Insert emoji"
            aria-expanded={emojiOpen}
            onClick={() => setEmojiOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
              "glass-card text-zinc-700 dark:text-zinc-200",
              emojiOpen && "ring-1 ring-violet-500/40",
              disabled && "pointer-events-none opacity-40",
            )}
          >
            <Smile className="h-4 w-4" />
            Emoji
          </button>
          {!mobileSheet && emojiOpen ? (
            <EmojiPickerPopover
              open={emojiOpen}
              onClose={() => setEmojiOpen(false)}
              onPick={(emoji) => {
                insertEmoji(emoji);
                setEmojiOpen(false);
              }}
              anchorRef={emojiBtnRef}
              useMobileSheet={false}
            />
          ) : null}
        </div>
      </div>

      {mobileSheet ? (
        <EmojiPickerPopover
          open={emojiOpen}
          onClose={() => setEmojiOpen(false)}
          onPick={(emoji) => {
            insertEmoji(emoji);
            setEmojiOpen(false);
          }}
          anchorRef={emojiBtnRef}
          useMobileSheet
        />
      ) : null}

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
