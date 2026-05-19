import { EDGECASES_VIDEO_BUCKET } from "./constants";

export function edgeCaseFolder(edgeCaseId: string): string {
  return `edgecases/${edgeCaseId}`;
}

export function edgeCaseVideoPath(
  edgeCaseId: string,
  ext: "mp4" | "mov" | "webm" = "mp4",
): string {
  return `${edgeCaseFolder(edgeCaseId)}/video.${ext}`;
}

export function edgeCaseThumbnailPath(edgeCaseId: string): string {
  return `${edgeCaseFolder(edgeCaseId)}/thumbnail.jpg`;
}

export function videoExtensionFromMime(mime: string): "mp4" | "mov" | "webm" {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("quicktime") || mime.includes("mov")) return "mov";
  return "mp4";
}

export function videoExtensionFromFile(file: File): "mp4" | "mov" | "webm" {
  const name = file.name.toLowerCase();
  if (name.endsWith(".webm")) return "webm";
  if (name.endsWith(".mov")) return "mov";
  return videoExtensionFromMime(file.type || "video/mp4");
}

export function edgeCaseStoragePublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base || !storagePath) return null;
  const encoded = storagePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/${EDGECASES_VIDEO_BUCKET}/${encoded}`;
}
