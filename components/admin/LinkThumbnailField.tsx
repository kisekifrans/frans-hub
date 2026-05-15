"use client";

import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import type { LinkThumbnailLayout } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LinkThumbnailFieldProps {
  thumbnailUrl: string;
  thumbnailLayout: LinkThumbnailLayout;
  onUrlChange: (url: string) => void;
  onLayoutChange: (layout: LinkThumbnailLayout) => void;
  onClear: () => void;
}

export function LinkThumbnailField({
  thumbnailUrl,
  thumbnailLayout,
  onUrlChange,
  onLayoutChange,
  onClear,
}: LinkThumbnailFieldProps) {
  const trimmed = thumbnailUrl.trim();
  const hasPreview = trimmed.length > 0;

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-white/25 bg-white/20 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <ImageIcon className="h-4 w-4" />
          Thumbnail
        </span>
        {hasPreview && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-rose-500 hover:underline"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      <input
        type="url"
        value={thumbnailUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
      />

      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Layout
        <select
          value={thumbnailLayout}
          onChange={(e) =>
            onLayoutChange(e.target.value as LinkThumbnailLayout)
          }
          disabled={!hasPreview}
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm disabled:opacity-50 dark:bg-white/10"
        >
          <option value="side">Side — square image beside title</option>
          <option value="banner">Banner — wide image above title</option>
        </select>
      </label>

      {hasPreview && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-500">Preview</p>
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-white/20 bg-white/40 dark:bg-white/5",
              thumbnailLayout === "banner" ? "max-w-xs" : "inline-block",
            )}
          >
            {thumbnailLayout === "banner" ? (
              <div>
                <div className="relative aspect-[2/1] w-full min-w-[200px]">
                  <Image
                    src={trimmed}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Link title appears here
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 pr-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={trimmed}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Link title
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
