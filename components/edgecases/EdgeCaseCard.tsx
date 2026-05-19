"use client";

import { memo, useCallback } from "react";
import {
  Copy,
  ExternalLink,
  Pencil,
  Play,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { LazyThumbnail } from "@/components/edgecases/LazyThumbnail";
import { getAtlasReviewUrl } from "@/lib/audit/atlas";
import { formatShortDate } from "@/lib/finance/format";
import type { EdgeCase } from "@/lib/edgecases/types";
import { cn } from "@/lib/utils";

const inputClass =
  "rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5";

interface EdgeCaseCardProps {
  item: EdgeCase;
  onPlay: (item: EdgeCase) => void;
  onEdit: (item: EdgeCase) => void;
  onDuplicate: (item: EdgeCase) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (item: EdgeCase) => void;
}

function EdgeCaseCardInner({
  item,
  onPlay,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: EdgeCaseCardProps) {
  const copyReject = useCallback(async () => {
    const text = item.rejectReason?.trim();
    if (!text) {
      toast.error("No reject reason to copy");
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success("Reject reason copied");
  }, [item.rejectReason]);

  const qaExternal = getAtlasReviewUrl(item.episodeId) ?? item.qaUrl;
  const thumbSrc = item.thumbnailUrl;
  const canPlay = Boolean(item.videoUrl?.trim());

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <button
        type="button"
        className="group relative block w-full text-left"
        onClick={() => onPlay(item)}
      >
        <LazyThumbnail
          src={thumbSrc}
          alt={item.title}
          className="rounded-none rounded-t-2xl"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/90 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
          </span>
        </span>
      </button>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
              {item.title}
            </h3>
            {item.description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                {item.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(item)}
            className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-amber-500"
            aria-label={item.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star
              className={cn(
                "h-4 w-4",
                item.isFavorite && "fill-amber-400 text-amber-500",
              )}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {item.decision ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                item.decision === "approve" &&
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                item.decision === "reject" &&
                  "bg-rose-500/15 text-rose-700 dark:text-rose-400",
                item.decision === "pending" &&
                  "bg-amber-500/15 text-amber-700 dark:text-amber-400",
              )}
            >
              {item.decision}
            </span>
          ) : null}
          {item.projectName ? (
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-700 dark:text-violet-300">
              {item.projectName}
            </span>
          ) : null}
          <span className="text-[10px] text-zinc-400">
            {formatShortDate(item.createdAt.slice(0, 10))}
          </span>
        </div>

        {item.rejectReason ? (
          <p className="rounded-lg bg-rose-500/5 px-2 py-1.5 text-xs text-rose-700 dark:text-rose-300">
            {item.rejectReason}
          </p>
        ) : null}

        {item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] dark:bg-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onPlay(item)}
            disabled={!canPlay}
            className={cn(
              inputClass,
              "flex items-center justify-center gap-1 font-medium",
              !canPlay && "opacity-40",
            )}
          >
            <Play className="h-3.5 w-3.5" /> Play
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className={cn(inputClass, "flex items-center justify-center gap-1")}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(item)}
            className={cn(inputClass, "flex items-center justify-center gap-1")}
          >
            <Copy className="h-3.5 w-3.5" /> Dup
          </button>
          {item.rejectReason ? (
            <button
              type="button"
              onClick={() => void copyReject()}
              className={cn(inputClass, "col-span-2 flex items-center justify-center gap-1 sm:col-span-1")}
            >
              <Copy className="h-3.5 w-3.5" /> Reason
            </button>
          ) : null}
          {qaExternal ? (
            <a
              href={qaExternal}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                inputClass,
                "flex items-center justify-center gap-1 no-underline",
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open QA
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${item.title}"?`)) onDelete(item.id);
            }}
            className={cn(
              inputClass,
              "flex items-center justify-center gap-1 text-rose-600 hover:bg-rose-500/10",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" /> Del
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export const EdgeCaseCard = memo(EdgeCaseCardInner);
