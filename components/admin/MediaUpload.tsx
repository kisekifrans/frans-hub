"use client";

import { useCallback, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { isValidImageSrc } from "@/lib/image-utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { assetPath, uploadAsset, removeAsset } from "@/lib/supabase/hub-service";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  profileId: string;
  blockId: string;
  folder: "thumbnails" | "gifs" | "avatars" | "collections";
  label: string;
  accept?: string;
  currentUrl?: string;
  storagePath?: string;
  onUploaded: (url: string, storagePath: string) => void;
  onClear?: () => void;
  previewAspect?: "square" | "video" | "portrait";
  maxSizeMb?: number;
  allowVideo?: boolean;
}

export function MediaUpload({
  profileId,
  blockId,
  folder,
  label,
  accept = "image/*,.gif",
  currentUrl,
  storagePath,
  onUploaded,
  onClear,
  previewAspect = folder === "gifs" ? "video" : "square",
  maxSizeMb = 8,
  allowVideo = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = allowVideo && file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        toast.error("Please upload an image, GIF, or video");
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`Max file size is ${maxSizeMb}MB`);
        return;
      }
      setUploading(true);
      setProgress(15);
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = assetPath(
          profileId,
          folder,
          `${blockId}.${ext}`,
        );
        const supabase = createClient();
        if (storagePath) {
          await removeAsset(supabase, storagePath).catch(() => {});
        }
        setProgress(55);
        const { publicUrl, storagePath: newPath } = await uploadAsset(
          supabase,
          file,
          path,
        );
        setProgress(100);
        onUploaded(publicUrl, newPath);
        toast.success("Uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 350);
      }
    },
    [profileId, blockId, folder, onUploaded, storagePath, maxSizeMb, allowVideo],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <ImageIcon className="h-4 w-4" />
          {label}
        </span>
        {currentUrl && onClear && (
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
          uploading && "pointer-events-none opacity-60",
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

      {isValidImageSrc(currentUrl) && (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-white/20",
            previewAspect === "video"
              ? "aspect-video"
              : previewAspect === "portrait"
                ? "aspect-[3/4] max-w-[140px]"
                : "aspect-square max-w-[120px]",
          )}
        >
          <SafeImage
            src={currentUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
