import type { CSSProperties } from "react";

export interface ThumbnailFocus {
  /** 0–100, horizontal focal point */
  x: number;
  /** 0–100, vertical focal point */
  y: number;
  /** 1–2.5, zoom within frame */
  scale: number;
}

export const DEFAULT_THUMBNAIL_FOCUS: ThumbnailFocus = {
  x: 50,
  y: 50,
  scale: 1,
};

export function parseThumbnailFocus(raw: unknown): ThumbnailFocus | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x);
  const y = Number(o.y);
  const scale = Number(o.scale ?? 1);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
    scale: clamp(Number.isFinite(scale) ? scale : 1, 1, 2.5),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function normalizeThumbnailFocus(
  focus?: ThumbnailFocus | null,
): ThumbnailFocus {
  if (!focus) return { ...DEFAULT_THUMBNAIL_FOCUS };
  return {
    x: clamp(focus.x, 0, 100),
    y: clamp(focus.y, 0, 100),
    scale: clamp(focus.scale ?? 1, 1, 2.5),
  };
}

/** Styles for object-cover thumbnails (link cards, previews). */
export function thumbnailFocusStyle(
  focus?: ThumbnailFocus | null,
): CSSProperties {
  const f = normalizeThumbnailFocus(focus);
  const scale = f.scale;
  return {
    objectPosition: `${f.x}% ${f.y}%`,
    ...(scale > 1
      ? {
          transform: `scale(${scale})`,
          transformOrigin: `${f.x}% ${f.y}%`,
        }
      : {}),
  };
}
