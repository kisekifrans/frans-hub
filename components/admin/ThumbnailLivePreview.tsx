"use client";

import { MediaPreview } from "@/components/ui/MediaPreview";
import { thumbnailFocusStyle } from "@/lib/thumbnail-focus";
import type { LinkThumbnailLayout } from "@/lib/types";
import type { ThumbnailFocus } from "@/lib/thumbnail-focus";

interface ThumbnailLivePreviewProps {
  imageUrl: string;
  layout: LinkThumbnailLayout;
  mediaKey: string;
  focus?: ThumbnailFocus | null;
  title?: string;
}

/** Mirrors public link card thumbnail appearance */
export function ThumbnailLivePreview({
  imageUrl,
  layout,
  mediaKey,
  focus,
  title = "Link title",
}: ThumbnailLivePreviewProps) {
  const style = thumbnailFocusStyle(focus);
  const isBanner = layout === "banner";

  return (
    <div className="rounded-xl border border-white/20 bg-white/20 p-3 dark:bg-white/5">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        Final thumbnail preview
      </p>
      <div className="overflow-hidden rounded-xl border border-white/25 bg-white/30 shadow-sm dark:bg-white/10">
        {isBanner ? (
          <div>
            <div className="relative aspect-[2/1] w-full overflow-hidden">
              <MediaPreview
                mediaKey={mediaKey}
                keyPrefix="live-banner"
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                style={style}
                sizes="320px"
              />
            </div>
            <p className="truncate px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {title}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-white/30 dark:ring-white/10">
              <MediaPreview
                mediaKey={mediaKey}
                keyPrefix="live-side"
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                style={style}
                sizes="96px"
              />
            </div>
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
