"use client";

import { Move } from "lucide-react";
import { InteractiveThumbnailCrop } from "@/components/admin/InteractiveThumbnailCrop";
import { ThumbnailLivePreview } from "@/components/admin/ThumbnailLivePreview";
import { DEFAULT_THUMBNAIL_FOCUS } from "@/lib/thumbnail-focus";
import { mediaReactKey } from "@/lib/media-url";
import type { ThumbnailFocus } from "@/lib/thumbnail-focus";
import type { LinkThumbnailLayout } from "@/lib/types";

interface ThumbnailFocusEditorProps {
  imageUrl: string;
  layout: LinkThumbnailLayout;
  /** Stable id (gear item id, block id) — avoids duplicate React keys */
  mediaKey: string;
  focus?: ThumbnailFocus | null;
  onChange: (focus: ThumbnailFocus) => void;
  onResetFocus?: () => void;
  previewTitle?: string;
}

export function ThumbnailFocusEditor({
  imageUrl,
  layout,
  mediaKey,
  focus,
  onChange,
  onResetFocus,
  previewTitle,
}: ThumbnailFocusEditorProps) {
  const cropKey = mediaReactKey("crop", mediaKey, imageUrl);
  const liveKey = mediaReactKey("live", mediaKey, imageUrl);

  return (
    <div className="space-y-3 rounded-xl border border-white/20 bg-white/15 p-3 dark:bg-white/5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <Move className="h-3.5 w-3.5" />
          Crop & position
        </span>
        <button
          type="button"
          onClick={() =>
            onResetFocus
              ? onResetFocus()
              : onChange({ ...DEFAULT_THUMBNAIL_FOCUS })
          }
          className="text-xs text-violet-600 hover:underline dark:text-violet-300"
        >
          Reset
        </button>
      </div>

      <InteractiveThumbnailCrop
        key={cropKey}
        imageUrl={imageUrl}
        layout={layout}
        mediaKey={mediaKey}
        focus={focus}
        onChange={onChange}
      />

      <ThumbnailLivePreview
        key={liveKey}
        imageUrl={imageUrl}
        layout={layout}
        mediaKey={mediaKey}
        focus={focus}
        title={previewTitle}
      />

      <p className="text-[11px] leading-relaxed text-zinc-500">
        {layout === "banner"
          ? "Wide crop (2:1) matches the banner on your link card."
          : "Square crop (1:1) matches the side thumbnail on your link card."}
      </p>
    </div>
  );
}
