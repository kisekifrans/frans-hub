"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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

const PICKER_WIDTH = 340;
const PICKER_HEIGHT_DESKTOP = 340;
const PICKER_HEIGHT_MOBILE = 300;

interface EmojiPickerPopoverProps {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  useMobileSheet?: boolean;
  /** Render in a body portal (avoids overlap with sibling cards below). */
  usePortal?: boolean;
}

function computePortalPosition(anchor: HTMLElement, pickerHeight: number) {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(PICKER_WIDTH, window.innerWidth - 16);
  const gap = 8;
  let top = rect.bottom + gap;
  if (top + pickerHeight > window.innerHeight - 12) {
    top = Math.max(12, rect.top - pickerHeight - gap);
  }
  let left = rect.right - width;
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
  return { top, left, width };
}

export function EmojiPickerPopover({
  open,
  onClose,
  onPick,
  anchorRef,
  useMobileSheet = false,
  usePortal = false,
}: EmojiPickerPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme, mounted } = useTheme();
  const [portalPos, setPortalPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!open || !usePortal || useMobileSheet) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const update = () => {
      setPortalPos(computePortalPosition(anchor, PICKER_HEIGHT_DESKTOP));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, usePortal, useMobileSheet, anchorRef]);

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

  const pickerHeight = useMobileSheet ? PICKER_HEIGHT_MOBILE : PICKER_HEIGHT_DESKTOP;

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Pilih emoji"
      className={cn(
        "qr-emoji-picker overflow-hidden rounded-2xl border border-white/30 shadow-2xl shadow-violet-500/15",
        "bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95",
        useMobileSheet && "w-full max-h-[min(70vh,400px)]",
        usePortal &&
          "fixed z-[250] w-[min(100vw-2rem,340px)]",
        !usePortal &&
          !useMobileSheet &&
          "absolute right-0 top-full z-[80] mt-2 w-[min(100vw-2rem,340px)]",
      )}
      style={
        usePortal && portalPos
          ? {
              top: portalPos.top,
              left: portalPos.left,
              width: portalPos.width,
            }
          : undefined
      }
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
          className="fixed inset-0 z-[240] bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div className="fixed inset-x-2 bottom-2 z-[250] max-h-[min(70vh,420px)]">
          {panel}
        </div>
      </>,
      document.body,
    );
  }

  if (usePortal) {
    if (!portalPos) return null;
    return createPortal(panel, document.body);
  }

  return panel;
}
