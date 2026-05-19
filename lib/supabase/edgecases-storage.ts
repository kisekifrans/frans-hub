import type { SupabaseClient } from "@supabase/supabase-js";
import { EDGECASES_VIDEO_BUCKET } from "@/lib/edgecases/constants";
import { edgeCaseFolder } from "@/lib/edgecases/storage-paths";
import { edgeCaseStoragePublicUrl } from "@/lib/edgecases/storage-paths";

export type UploadProgressHandler = (percent: number) => void;

export async function uploadEdgeCaseFile(
  supabase: SupabaseClient,
  storagePath: string,
  file: File | Blob,
  contentType: string,
  onProgress?: UploadProgressHandler,
): Promise<{ storagePath: string; publicUrl: string }> {
  onProgress?.(5);

  let tick = 10;
  const timer =
    onProgress &&
    setInterval(() => {
      tick = Math.min(tick + 4, 88);
      onProgress(tick);
    }, 400);

  try {
    const { error } = await supabase.storage
      .from(EDGECASES_VIDEO_BUCKET)
      .upload(storagePath, file, {
        upsert: true,
        cacheControl: "3600",
        contentType,
      });

    if (error) throw error;

    onProgress?.(100);
    const publicUrl = edgeCaseStoragePublicUrl(storagePath);
    if (!publicUrl) throw new Error("Missing Supabase public URL config");

    return { storagePath, publicUrl };
  } finally {
    if (timer) clearInterval(timer);
  }
}

export async function removeEdgeCaseStorage(
  supabase: SupabaseClient,
  edgeCaseId: string,
): Promise<void> {
  const prefix = edgeCaseFolder(edgeCaseId);
  const { data, error } = await supabase.storage
    .from(EDGECASES_VIDEO_BUCKET)
    .list(prefix);

  if (error) throw error;
  if (!data?.length) return;

  const paths = data.map((f) => `${prefix}/${f.name}`);
  const { error: removeError } = await supabase.storage
    .from(EDGECASES_VIDEO_BUCKET)
    .remove(paths);

  if (removeError) throw removeError;
}
