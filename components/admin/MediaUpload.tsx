"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { assetPath, uploadAsset, removeAsset } from "@/lib/supabase/hub-service";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  profileId: string;
  blockId: string;
  folder: "thumbnails" | "gifs" | "avatars";
  label: string;
  accept?: string;
  currentUrl?: string;
  storagePath?: string;
  onUploaded: (url: string, storagePath: string) => void;
  onClear?: () => void;
  previewAspect?: "square" | "video";
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
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image or GIF");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Max file size is 8MB");
        return;
      }
      setUploading(true);
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
        const { publicUrl, storagePath: newPath } = await uploadAsset(
          supabase,
          file,
          path,
        );
        onUploaded(publicUrl, newPath);
        toast.success("Uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [profileId, blockId, folder, onUploaded, storagePath],
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
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        ) : (
          <>
            <Upload className="mb-2 h-6 w-6 text-zinc-400" />
            <span className="text-xs text-zinc-500">
              Drag & drop or click to upload
            </span>
          </>
        )}
      </label>

      {currentUrl && (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-white/20",
            previewAspect === "video" ? "aspect-video" : "aspect-square max-w-[120px]",
          )}
        >
          <Image
            src={currentUrl}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
