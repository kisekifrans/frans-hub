import type { SupabaseClient } from "@supabase/supabase-js";
import { FINANCE_IMPORTS_BUCKET } from "@/lib/finance/import/constants";

export function financeImportPath(
  profileId: string,
  filename: string,
): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return `imports/${profileId}/${Date.now()}-${safe}`;
}

export async function uploadFinanceImportPdf(
  supabase: SupabaseClient,
  profileId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ storagePath: string; fileUrl: string }> {
  const path = financeImportPath(profileId, file.name);
  onProgress?.(10);

  const { error } = await supabase.storage
    .from(FINANCE_IMPORTS_BUCKET)
    .upload(path, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: "application/pdf",
    });

  if (error) throw error;
  onProgress?.(100);

  const { data } = supabase.storage
    .from(FINANCE_IMPORTS_BUCKET)
    .getPublicUrl(path);

  return { storagePath: path, fileUrl: data.publicUrl };
}

export async function downloadFinanceImportPdf(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(FINANCE_IMPORTS_BUCKET)
    .download(storagePath);
  if (error || !data) throw error ?? new Error("Download failed");
  return data;
}

export async function removeFinanceImportFile(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(FINANCE_IMPORTS_BUCKET)
    .remove([storagePath]);
  if (error) throw error;
}
