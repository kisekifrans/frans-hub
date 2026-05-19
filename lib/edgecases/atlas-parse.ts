import { ATLAS_REVIEW_BASE } from "@/lib/audit/atlas";

/** Extract episode id from Atlas QA review URL or raw id string. */
export function parseEpisodeIdFromQaInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : null;
    if (url) {
      const match = url.pathname.match(/\/review\/([^/]+)/i);
      if (match?.[1]) return decodeURIComponent(match[1]);
    }
  } catch {
    /* not a URL */
  }

  const pathMatch = trimmed.match(/\/review\/([^/?#]+)/i);
  if (pathMatch?.[1]) return decodeURIComponent(pathMatch[1]);

  if (/^[a-zA-Z0-9_-]{8,128}$/.test(trimmed)) return trimmed;

  return null;
}

export function buildQaUrlFromEpisodeId(episodeId: string | null | undefined): string {
  const id = episodeId?.trim();
  if (!id) return "";
  return `${ATLAS_REVIEW_BASE}/${encodeURIComponent(id)}`;
}
