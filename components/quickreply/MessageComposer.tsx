"use client";

import { Smile } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmojiPickerPopover } from "@/components/quickreply/EmojiPickerPopover";
import {
  countCharacters,
  focusCaret,
  insertAtCaret,
  resizeTextarea,
} from "@/lib/quickreply/editor";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function MessageComposer({
  value,
  onChange,
  onSave,
  placeholder = "Tulis pesan…",
  maxLength = 4000,
}: MessageComposerProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobileSheet(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = areaRef.current;
    if (el) resizeTextarea(el);
  }, [value]);

  useEffect(() => {
    if (pendingCaret.current == null || !areaRef.current) return;
    focusCaret(areaRef.current, pendingCaret.current);
    pendingCaret.current = null;
  }, [value]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = areaRef.current;
      if (!el) {
        onChange(value + emoji);
        return;
      }
      const { next, caret } = insertAtCaret(
        value,
        emoji,
        el.selectionStart ?? value.length,
        el.selectionEnd ?? value.length,
      );
      pendingCaret.current = caret;
      onChange(next);
    },
    [onChange, value],
  );

  const charCount = countCharacters(value);
  const nearLimit = charCount > maxLength * 0.9;

  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Isi pesan
        </span>
        <span
          className={cn(
            "text-[10px] tabular-nums",
            nearLimit ? "text-amber-600 dark:text-amber-400" : "text-zinc-400",
          )}
        >
          {charCount.toLocaleString("id-ID")}
          {maxLength ? ` / ${maxLength.toLocaleString("id-ID")}` : ""}
        </span>
      </div>

      <div
        ref={wrapRef}
        className="relative rounded-xl border border-white/30 bg-white/40 dark:border-white/10 dark:bg-white/5"
      >
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              onSave?.();
            }
          }}
          rows={5}
          maxLength={maxLength}
          className="w-full resize-none bg-transparent px-3 py-2.5 pb-12 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
          placeholder={placeholder}
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <button
            ref={emojiBtnRef}
            type="button"
            aria-label="Sisipkan emoji"
            aria-expanded={emojiOpen}
            onClick={() => setEmojiOpen((o) => !o)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition",
              emojiOpen
                ? "border-violet-400/50 bg-violet-500/15 text-violet-600 dark:text-violet-300"
                : "border-white/30 bg-white/60 text-zinc-600 hover:bg-white/80 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/15",
            )}
          >
            <Smile className="h-[18px] w-[18px]" />
          </button>
        </div>

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

      <p className="mt-1.5 text-[10px] text-zinc-400">
        Ctrl+Enter untuk simpan · emoji disisipkan di posisi kursor
      </p>
    </label>
  );
}
