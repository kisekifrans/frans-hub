export const ATLAS_REVIEW_BASE = "https://qa.atlascapture.io/review";

export function getAtlasReviewUrl(episodeId: string | null | undefined): string | null {
  const id = episodeId?.trim();
  if (!id) return null;
  return `${ATLAS_REVIEW_BASE}/${encodeURIComponent(id)}`;
}

export function openAtlasReview(episodeId: string | null | undefined): boolean {
  const url = getAtlasReviewUrl(episodeId);
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
