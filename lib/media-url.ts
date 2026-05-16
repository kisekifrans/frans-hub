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
