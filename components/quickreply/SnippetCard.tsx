"use client";

import { motion } from "framer-motion";
import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { QuickReply } from "@/lib/quickreply/types";
import { cn } from "@/lib/utils";

interface SnippetCardProps {
  snippet: QuickReply;
  selected: boolean;
  copyPulse: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export function SnippetCard({
  snippet,
  selected,
  copyPulse,
  onSelect,
  onCopy,
  onEdit,
  onToggleFavorite,
  onTogglePin,
  onDelete,
}: SnippetCardProps) {
  return (
    <GlassCard
      padding="md"
      hover
      className={cn(
        "cursor-pointer transition-all",
        selected && "ring-2 ring-violet-400/50",
        copyPulse && "scale-[1.02] ring-2 ring-emerald-400/60",
      )}
      onClick={onSelect}
    >
      <motion.div className="flex items-start justify-between gap-2">
        <motion.div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {snippet.title}
            </h3>
            {snippet.pinned ? (
              <Pin className="h-3 w-3 text-violet-500" aria-label="Disematkan" />
            ) : null}
            {snippet.favorite ? (
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-label="Favorit" />
            ) : null}
          </div>
          <span className="mt-0.5 inline-block rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
            {snippet.category}
          </span>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {snippet.content}
          </p>
        </motion.div>
      </motion.div>

      <div
        className="mt-3 flex flex-wrap gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 active:scale-[0.97]"
        >
          <Copy className="h-3.5 w-3.5" />
          Salin
        </button>
        <IconBtn onClick={onEdit} label="Edit">
          <Pencil className="h-4 w-4" />
        </IconBtn>
        <IconBtn
          onClick={onToggleFavorite}
          label="Favorit"
          active={snippet.favorite}
        >
          <Star
            className={cn("h-4 w-4", snippet.favorite && "fill-amber-400 text-amber-400")}
          />
        </IconBtn>
        <IconBtn onClick={onTogglePin} label="Sematkan" active={snippet.pinned}>
          <Pin className={cn("h-4 w-4", snippet.pinned && "text-violet-500")} />
        </IconBtn>
        <IconBtn onClick={onDelete} label="Hapus" danger>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      </div>
    </GlassCard>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 transition",
        "hover:bg-white/50 dark:hover:bg-white/10",
        active && "border-violet-400/40 bg-violet-500/10",
        danger && "hover:border-rose-400/40 hover:text-rose-500",
      )}
    >
      {children}
    </button>
  );
}
