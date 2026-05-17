"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import EmojiPickerReact, {
  Theme as EmojiTheme,
  type EmojiClickData,
} from "emoji-picker-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(() => Promise.resolve(EmojiPickerReact), {
  ssr: false,
});

interface EmojiPickerPopoverProps {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  useMobileSheet?: boolean;
}

export function EmojiPickerPopover({
  open,
  onClose,
  onPick,
  anchorRef,
  useMobileSheet = false,
}: EmojiPickerPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme, mounted } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !mounted) return null;

  const pickerTheme =
    theme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT;

  const pickerHeight = useMobileSheet ? 300 : 340;

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Pilih emoji"
      className={cn(
        "qr-emoji-picker overflow-hidden rounded-2xl border border-white/30 shadow-2xl shadow-violet-500/15",
        "bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95",
        useMobileSheet
          ? "w-full max-h-[min(70vh,400px)]"
          : "absolute right-0 top-full z-[80] mt-2 w-[min(100vw-2rem,340px)]",
      )}
    >
      <EmojiPicker
        onEmojiClick={(data: EmojiClickData) => onPick(data.emoji)}
        theme={pickerTheme}
        width="100%"
        height={pickerHeight}
        searchPlaceholder="Cari emoji…"
        lazyLoadEmojis
        previewConfig={{ showPreview: true }}
        skinTonesDisabled
      />
    </div>
  );

  if (useMobileSheet) {
    return createPortal(
      <>
        <button
          type="button"
          aria-label="Tutup"
          className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div className="fixed inset-x-2 bottom-2 z-[100] max-h-[min(70vh,420px)]">
          {panel}
        </div>
      </>,
      document.body,
    );
  }

  return panel;
}
