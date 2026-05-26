/**
 * Validates URLs persisted in profile blocks (link / gif / tiktok / instagram).
 *
 * Goals:
 * - Block dangerous URI schemes (javascript:, data:, vbscript:, file:).
 * - Restrict embed blocks to their canonical providers so the embed loader
 *   never fetches an attacker-controlled URL.
 * - Allow empty strings for unfinished drafts; the renderer no-ops on those.
 */

import type { BlockType } from "@/lib/types";

const TIKTOK_HOST_RE = /^(www\.|m\.|vm\.|vt\.)?tiktok\.com$/i;
const INSTAGRAM_HOST_RE = /^(www\.)?instagram\.com$/i;

const HTTP_URL_MAX_LENGTH = 2048;

function isAllowedHttpUrl(value: string): URL | null {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (value.length > HTTP_URL_MAX_LENGTH) return null;
    return u;
  } catch {
    return null;
  }
}

export type BlockUrlValidation =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export function validateBlockUrl(
  type: BlockType,
  rawUrl: string | null | undefined,
): BlockUrlValidation {
  const trimmed = (rawUrl ?? "").trim();
  if (!trimmed) return { ok: true, url: "" };

  const parsed = isAllowedHttpUrl(trimmed);
  if (!parsed) {
    return {
      ok: false,
      reason: "Only http(s) URLs are allowed.",
    };
  }

  if (type === "tiktok") {
    if (!TIKTOK_HOST_RE.test(parsed.hostname)) {
      return {
        ok: false,
        reason: "TikTok embeds must use a tiktok.com URL.",
      };
    }
  } else if (type === "instagram") {
    if (!INSTAGRAM_HOST_RE.test(parsed.hostname)) {
      return {
        ok: false,
        reason: "Instagram embeds must use an instagram.com URL.",
      };
    }
  }

  return { ok: true, url: parsed.toString() };
}

export function assertValidBlockUrl(
  type: BlockType,
  rawUrl: string | null | undefined,
): string {
  const result = validateBlockUrl(type, rawUrl);
  if (!result.ok) {
    throw new Error(result.reason);
  }
  return result.url;
}
