/** Append a version query so browsers/CDN fetch the latest file after re-upload. */
export function cacheBustMediaUrl(
  publicUrl: string,
  version: number | string = Date.now(),
): string {
  try {
    const url = new URL(publicUrl);
    url.searchParams.set("v", String(version));
    return url.toString();
  } catch {
    const sep = publicUrl.includes("?") ? "&" : "?";
    return `${publicUrl}${sep}v=${version}`;
  }
}

/** Unique storage object name per upload (avoids stale CDN/browser cache on upsert). */
export function uniqueMediaFilename(blockId: string, ext: string): string {
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `${blockId}-${Date.now()}.${safeExt}`;
}

/** Strip ?v= for display comparisons; storage paths never include query strings. */
export function mediaUrlWithoutVersion(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("v");
    return u.toString();
  } catch {
    return url.split("?")[0] ?? url;
  }
}

export function mediaVersionFromUrl(url: string | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.searchParams.get("v") ?? "";
  } catch {
    const match = url.match(/[?&]v=([^&]+)/);
    return match?.[1] ?? "";
  }
}

/** Stable React key — never use raw imageUrl alone when siblings share the same src. */
export function mediaReactKey(
  prefix: string,
  stableId: string,
  url?: string | null,
): string {
  const version = url ? mediaVersionFromUrl(url) : "none";
  return `${prefix}-${stableId}-${version}`;
}

export function isGifMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = mediaUrlWithoutVersion(url).split("?")[0]!.toLowerCase();
  return path.endsWith(".gif");
}

export function ensureCacheBustUrl(
  url: string | null | undefined,
  fallbackVersion: string | number,
): string | undefined {
  if (!url) return undefined;
  if (mediaVersionFromUrl(url)) return url;
  return cacheBustMediaUrl(url, fallbackVersion);
}

const MIME_BY_EXT: Record<string, string> = {
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export function extensionFromFile(file: File): string {
  if (file.type === "image/gif") return "gif";
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && MIME_BY_EXT[fromName]) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  return fromName || "jpg";
}

export function mimeTypeFromFile(file: File): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const ext = extensionFromFile(file);
  return MIME_BY_EXT[ext] ?? "image/jpeg";
}
