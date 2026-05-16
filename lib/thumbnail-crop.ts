import type { LinkThumbnailLayout } from "@/lib/types";
import {
  DEFAULT_THUMBNAIL_FOCUS,
  normalizeThumbnailFocus,
  type ThumbnailFocus,
} from "@/lib/thumbnail-focus";

/** Locked crop frame aspect (width / height) per layout */
export function thumbnailCropAspect(layout: LinkThumbnailLayout): number {
  return layout === "banner" ? 2 : 1;
}

export function thumbnailCropFrameClass(layout: LinkThumbnailLayout): string {
  return layout === "banner" ? "aspect-[2/1] w-full" : "aspect-square w-full max-w-[200px]";
}

export function applyDragToFocus(
  focus: ThumbnailFocus,
  deltaX: number,
  deltaY: number,
  frameWidth: number,
  frameHeight: number,
): ThumbnailFocus {
  const f = normalizeThumbnailFocus(focus);
  const pxToPercentX = 100 / Math.max(frameWidth, 1);
  const pxToPercentY = 100 / Math.max(frameHeight, 1);
  return normalizeThumbnailFocus({
    x: f.x - deltaX * pxToPercentX,
    y: f.y - deltaY * pxToPercentY,
    scale: f.scale,
  });
}

export function applyZoomToFocus(
  focus: ThumbnailFocus,
  delta: number,
  focalX = 50,
  focalY = 50,
): ThumbnailFocus {
  const f = normalizeThumbnailFocus(focus);
  const nextScale = f.scale + delta;
  return normalizeThumbnailFocus({
    x: focalX,
    y: focalY,
    scale: nextScale,
  });
}

export function pinchDistance(
  touches: TouchList | { length: number; [index: number]: { clientX: number; clientY: number } },
): number {
  if (touches.length < 2) return 0;
  const a = touches[0];
  const b = touches[1];
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

export function openLinkUrl(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) return;
  try {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(href);
    window.open(parsed.href, "_blank", "noopener,noreferrer");
  } catch {
    /* invalid URL */
  }
}

export { DEFAULT_THUMBNAIL_FOCUS, normalizeThumbnailFocus };
