"use client";

import { useCallback, useRef, useState } from "react";
import { Film, ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  EDGECASE_MAX_UPLOAD_BYTES,
  EDGECASE_IMAGE_ACCEPT,
  EDGECASE_VIDEO_ACCEPT,
} from "@/lib/edgecases/constants";
import type { EdgeCaseMediaUploadResult } from "@/lib/edgecases/types";
import {
  edgeCaseThumbnailPath,
  edgeCaseVideoPath,
  videoExtensionFromFile,
} from "@/lib/edgecases/storage-paths";
import { captureVideoThumbnail, readVideoFileMeta } from "@/lib/edgecases/video-thumbnail";
import { createClient } from "@/lib/supabase/client";
import { uploadEdgeCaseFile } from "@/lib/supabase/edgecases-storage";
import { cn } from "@/lib/utils";

interface EdgeCaseVideoUploadProps {
  edgeCaseId: string;
  currentVideoUrl?: string;
  currentThumbnailUrl?: string;
  disabled?: boolean;
  onUploaded: (result: EdgeCaseMediaUploadResult) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

function isVideoFile(file: File): boolean {
  return (
    file.type.startsWith("video/") ||
    /\.(mp4|mov|webm)$/i.test(file.name)
  );
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function EdgeCaseVideoUpload({
  edgeCaseId,
  currentVideoUrl,
  currentThumbnailUrl,
  disabled,
  onUploaded,
  onUploadingChange,
}: EdgeCaseVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const setBusy = useCallback(
    (busy: boolean) => {
      setUploading(busy);
      onUploadingChange?.(busy);
    },
    [onUploadingChange],
  );

  const uploadVideo = useCallback(
    async (file: File) => {
      if (!isVideoFile(file)) {
        toast.error("Upload MP4, MOV, or WEBM");
        return;
      }
      if (file.size > EDGECASE_MAX_UPLOAD_BYTES) {
        toast.error("Max file size is 250MB");
        return;
      }

      setBusy(true);
      setProgress(0);
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      try {
        const supabase = createClient();
        const ext = videoExtensionFromFile(file);
        const videoPath = edgeCaseVideoPath(edgeCaseId, ext);
        const mime = file.type || `video/${ext === "mov" ? "quicktime" : ext}`;

        console.log("[edgecase] uploading video", videoPath, mime);

        let meta = { durationSeconds: 0 };
        try {
          meta = await readVideoFileMeta(file);
        } catch {
          /* optional */
        }

        const videoResult = await uploadEdgeCaseFile(
          supabase,
          videoPath,
          file,
          mime,
          setProgress,
        );

        let thumbPath = edgeCaseThumbnailPath(edgeCaseId);
        let thumbUrl = "";

        try {
          const thumbBlob = await captureVideoThumbnail(file);
          const thumbFile = new File([thumbBlob], "thumbnail.jpg", {
            type: "image/jpeg",
          });
          const thumbResult = await uploadEdgeCaseFile(
            supabase,
            thumbPath,
            thumbFile,
            "image/jpeg",
          );
          thumbUrl = thumbResult.publicUrl;
        } catch (e) {
          console.warn("[edgecase] auto thumbnail failed", e);
          thumbPath = "";
        }

        const payload: EdgeCaseMediaUploadResult = {
          uploadedVideoPath: videoResult.storagePath,
          thumbnailPath: thumbPath,
          videoUrl: videoResult.publicUrl,
          thumbnailUrl: thumbUrl,
          durationSeconds: meta.durationSeconds || undefined,
          fileSize: file.size,
          mimeType: mime,
        };

        console.log("[edgecase] upload complete", payload);
        onUploaded(payload);
        toast.success("Video uploaded");
      } catch (e) {
        console.error("[edgecase] upload failed", e);
        toast.error(e instanceof Error ? e.message : "Upload failed");
        setPreviewUrl(null);
      } finally {
        setBusy(false);
        URL.revokeObjectURL(localPreview);
      }
    },
    [edgeCaseId, onUploaded, setBusy],
  );

  const uploadManualThumbnail = useCallback(
    async (file: File) => {
      if (!isImageFile(file)) {
        toast.error("Upload a JPEG, PNG, or WebP image");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Thumbnail max 8MB");
        return;
      }

      setBusy(true);
      setProgress(0);
      try {
        const supabase = createClient();
        const path = edgeCaseThumbnailPath(edgeCaseId);
        const result = await uploadEdgeCaseFile(
          supabase,
          path,
          file,
          file.type || "image/jpeg",
          setProgress,
        );
        toast.success("Thumbnail updated");
        onUploaded({
          uploadedVideoPath: "",
          thumbnailPath: path,
          videoUrl: currentVideoUrl ?? "",
          thumbnailUrl: result.publicUrl,
          fileSize: 0,
          mimeType: file.type || "image/jpeg",
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Thumbnail upload failed");
      } finally {
        setBusy(false);
      }
    },
    [edgeCaseId, currentVideoUrl, onUploaded, setBusy],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) void uploadVideo(file);
  };

  const displayVideo = previewUrl || currentVideoUrl;
  const displayThumb = currentThumbnailUrl;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 text-center transition",
          dragOver
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/30 bg-white/20 dark:bg-white/5",
          (disabled || uploading) && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={EDGECASE_VIDEO_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadVideo(f);
            e.target.value = "";
          }}
        />
        <input
          ref={thumbInputRef}
          type="file"
          accept={EDGECASE_IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadManualThumbnail(f);
            e.target.value = "";
          }}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Uploading… {progress}%
            </p>
            <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-white/40">
              <div
                className="h-full bg-violet-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-2 h-8 w-8 text-violet-500" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Drop video here or tap to upload
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              MP4 · MOV · WEBM · max 250MB
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Choose video
            </button>
          </>
        )}
      </div>

      {displayVideo ? (
        <div className="overflow-hidden rounded-xl border border-white/20">
          <p className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            <Film className="h-3.5 w-3.5" /> Video ready for playback
          </p>
          <video
            src={displayVideo}
            className="aspect-video w-full bg-black object-contain"
            controls
            muted
            playsInline
            preload="metadata"
          />
        </div>
      ) : null}

      {displayThumb ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/20 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayThumb}
            alt=""
            className="h-14 w-24 rounded-lg object-cover"
          />
          <p className="text-xs text-zinc-500">Card thumbnail</p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => thumbInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 py-2 text-xs text-zinc-600 dark:text-zinc-300"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Upload custom thumbnail (optional)
      </button>
    </div>
  );
}
