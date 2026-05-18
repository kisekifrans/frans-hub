"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { FinanceTransaction } from "@/lib/finance/types";

const MENU_WIDTH = 168;
const MENU_HEIGHT_ESTIMATE = 140;

interface TransactionActionsMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  transaction: FinanceTransaction;
  onClose: () => void;
  onEdit: (t: FinanceTransaction) => void;
  onDuplicate: (t: FinanceTransaction) => void;
  onDelete: (t: FinanceTransaction) => void;
}

function computePosition(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const pad = 8;
  let top = rect.bottom + 4;
  let left = rect.right - MENU_WIDTH;

  if (top + MENU_HEIGHT_ESTIMATE > window.innerHeight - pad) {
    top = rect.top - MENU_HEIGHT_ESTIMATE - 4;
  }
  if (top < pad) top = pad;

  if (left < pad) left = pad;
  if (left + MENU_WIDTH > window.innerWidth - pad) {
    left = window.innerWidth - MENU_WIDTH - pad;
  }

  return { top, left };
}

export function TransactionActionsMenu({
  open,
  anchorEl,
  transaction,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: TransactionActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorEl) return;

    const update = () => {
      setPosition(computePosition(anchorEl));
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;

    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        anchorEl?.contains(target)
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
  }, [open, onClose, anchorEl]);

  if (!mounted || !open || !anchorEl) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        role="menu"
        aria-label="Transaction actions"
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[200] min-w-[168px] overflow-hidden rounded-xl border border-white/30 bg-white/95 py-1 shadow-xl shadow-violet-500/10 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95"
        style={{
          top: position.top,
          left: position.left,
          width: MENU_WIDTH,
        }}
      >
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-violet-500/10"
          onClick={() => onEdit(transaction)}
        >
          <Pencil className="h-4 w-4 shrink-0 text-violet-600" />
          Edit
        </button>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-violet-500/10"
          onClick={() => onDuplicate(transaction)}
        >
          <Copy className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-400" />
          Duplicate
        </button>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-500/10"
          onClick={() => onDelete(transaction)}
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          Delete
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
