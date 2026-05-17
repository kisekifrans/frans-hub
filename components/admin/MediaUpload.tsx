"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { isValidImageSrc } from "@/lib/image-utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  cacheBustMediaUrl,
  extensionFromFile,
  mimeTypeFromFile,
  uniqueMediaFilename,
} from "@/lib/media-url";
import { assetPath, uploadAsset, removeAsset } from "@/lib/supabase/hub-service";
import { thumbnailFocusStyle } from "@/lib/thumbnail-focus";
import type { ThumbnailFocus } from "@/lib/thumbnail-focus";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  profileId: string;
  blockId: string;
  folder: "thumbnails" | "gifs" | "avatars" | "gear";
  label: string;
  accept?: string;
  currentUrl?: string;
  storagePath?: string;
  onUploaded: (url: string, storagePath: string) => void | Promise<void>;
  onClear?: () => void;
  previewAspect?: "square" | "video" | "portrait";
  previewFocus?: ThumbnailFocus | null;
  maxSizeMb?: number;
  allowVideo?: boolean;
}

export function MediaUpload({
  profileId,
  blockId,
  folder,
  label,
  accept = "image/*,.gif,image/gif,.png,.jpg,.jpeg,.webp",
  currentUrl,
  storagePath,
  onUploaded,
  onClear,
  previewAspect = folder === "gifs" ? "video" : "square",
  previewFocus,
  maxSizeMb = 8,
  allowVideo = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localIsGif, setLocalIsGif] = useState(false);
  const blobRef = useRef<string | null>(null);

  const revokeBlob = useCallback(() => {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    setLocalPreview(null);
    setLocalIsGif(false);
  }, []);

  useEffect(() => () => revokeBlob(), [revokeBlob]);

  const upload = useCallback(
    async (file: File) => {
      const isImage =
        file.type.startsWith("image/") ||
        /\.(gif|png|jpe?g|webp)$/i.test(file.name);
      const isVideo = allowVideo && file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        toast.error("Please upload an image or GIF");
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`Max file size is ${maxSizeMb}MB`);
        return;
      }

      revokeBlob();
      const blobUrl = URL.createObjectURL(file);
      blobRef.current = blobUrl;
      setLocalIsGif(
        file.type === "image/gif" || /\.gif$/i.test(file.name),
      );
      setLocalPreview(blobUrl);
      setUploading(true);
      setProgress(15);

      try {
        const ext = extensionFromFile(file);
        const version = Date.now();
        const filename = uniqueMediaFilename(blockId, ext);
        const path = assetPath(profileId, folder, filename);
        const mime = mimeTypeFromFile(file);
        const supabase = createClient();

        if (storagePath) {
          await removeAsset(supabase, storagePath).catch(() => {});
        }

        setProgress(55);
        const { publicUrl, storagePath: newPath } = await uploadAsset(
          supabase,
          file,
          path,
          {
            contentType: mime,
            cacheControl:
              folder === "thumbnails" || folder === "gifs" || folder === "gear"
                ? "120"
                : "3600",
          },
        );
        setProgress(100);
        const bustedUrl = cacheBustMediaUrl(publicUrl, version);
        revokeBlob();
        await onUploaded(bustedUrl, newPath);
        toast.success("Uploaded");
      } catch (e) {
        revokeBlob();
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 350);
      }
    },
    [
      profileId,
      blockId,
      folder,
      onUploaded,
      storagePath,
      maxSizeMb,
      allowVideo,
      revokeBlob,
    ],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const previewSrc = uploading ? localPreview : currentUrl;
  const showPreview = isValidImageSrc(previewSrc);
  const preferNativeImg =
    localIsGif ||
    (previewSrc != null &&
      (previewSrc.startsWith("blob:") || /\.gif(\?|$)/i.test(previewSrc)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <ImageIcon className="h-4 w-4" />
          {label}
        </span>
        {currentUrl && onClear && !uploading && (
          <button
            type="button"
            onClick={() => {
              revokeBlob();
              onClear();
            }}
            className="flex items-center gap-1 text-xs text-rose-500 hover:underline"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition",
          dragOver
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/25 bg-white/20 hover:bg-white/30 dark:border-white/15 dark:bg-white/5",
          uploading && "pointer-events-none",
        )}
      >
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <div className="flex w-full max-w-[220px] flex-col items-center gap-2 px-2">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <span className="text-xs text-zinc-500">Mengunggah…</span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-6 w-6 text-zinc-400" />
            <span className="text-xs text-zinc-500">
              Drag & drop or click to upload
            </span>
          </>
        )}
      </label>

      {showPreview ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-white/20",
            uploading && "ring-2 ring-violet-400/30",
            previewAspect === "video"
              ? "aspect-video"
              : previewAspect === "portrait"
                ? "aspect-[3/4] max-w-[140px]"
                : "aspect-square max-w-[120px]",
          )}
        >
          <MediaPreview
            mediaKey={blockId}
            keyPrefix="upload"
            src={previewSrc}
            alt="Preview"
            fill
            priority
            loading="eager"
            preferNativeImg={preferNativeImg}
            className="object-cover"
            style={previewFocus ? thumbnailFocusStyle(previewFocus) : undefined}
          />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
