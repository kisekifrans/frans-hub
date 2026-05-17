"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Move } from "lucide-react";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { thumbnailFocusStyle } from "@/lib/thumbnail-focus";
import {
  applyDragToFocus,
  applyZoomToFocus,
  normalizeThumbnailFocus,
  pinchDistance,
  thumbnailCropFrameClass,
} from "@/lib/thumbnail-crop";
import type { ThumbnailFocus } from "@/lib/thumbnail-focus";
import type { LinkThumbnailLayout } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InteractiveThumbnailCropProps {
  imageUrl: string;
  layout: LinkThumbnailLayout;
  mediaKey: string;
  focus?: ThumbnailFocus | null;
  onChange: (focus: ThumbnailFocus) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 2.5;
const WHEEL_ZOOM = 0.08;
const PINCH_ZOOM = 0.004;

export function InteractiveThumbnailCrop({
  imageUrl,
  layout,
  mediaKey,
  focus,
  onChange,
}: InteractiveThumbnailCropProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef(normalizeThumbnailFocus(focus));
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const momentumRef = useRef<number | null>(null);

  const [localFocus, setLocalFocus] = useState(() =>
    normalizeThumbnailFocus(focus),
  );
  const [dragging, setDragging] = useState(false);

  focusRef.current = localFocus;

  useEffect(() => {
    const next = normalizeThumbnailFocus(focus);
    setLocalFocus(next);
    focusRef.current = next;
  }, [imageUrl, focus]);

  const flushChange = useCallback(
    (next: ThumbnailFocus) => {
      const normalized = normalizeThumbnailFocus(next);
      setLocalFocus(normalized);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        onChange(normalized);
        rafRef.current = null;
      });
    },
    [onChange],
  );

  const stopMomentum = useCallback(() => {
    if (momentumRef.current != null) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  const runMomentum = useCallback(() => {
    stopMomentum();
    const step = () => {
      const v = velocityRef.current;
      if (Math.abs(v.x) < 0.15 && Math.abs(v.y) < 0.15) {
        momentumRef.current = null;
        return;
      }
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = applyDragToFocus(
        focusRef.current,
        v.x,
        v.y,
        rect.width,
        rect.height,
      );
      flushChange(next);
      velocityRef.current = { x: v.x * 0.92, y: v.y * 0.92 };
      momentumRef.current = requestAnimationFrame(step);
    };
    momentumRef.current = requestAnimationFrame(step);
  }, [flushChange, stopMomentum]);

  useEffect(() => () => {
    stopMomentum();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, [stopMomentum]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    stopMomentum();
    e.preventDefault();
    frameRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragRef.current && frameRef.current) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = {
        x: dx * 0.65,
        y: dy * 0.65,
      };
      const rect = frameRef.current.getBoundingClientRect();
      const next = applyDragToFocus(
        focusRef.current,
        dx,
        dy,
        rect.width,
        rect.height,
      );
      flushChange(next);
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (frameRef.current?.hasPointerCapture(e.pointerId)) {
      frameRef.current.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setDragging(false);
    runMomentum();
  };

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -WHEEL_ZOOM : WHEEL_ZOOM;
      const f = focusRef.current;
      const next = applyZoomToFocus(f, delta, f.x, f.y);
      flushChange(next);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [flushChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        dist: pinchDistance(e.touches),
        scale: focusRef.current.scale,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = pinchDistance(e.touches);
      const delta = (dist - pinchRef.current.dist) * PINCH_ZOOM;
      const f = focusRef.current;
      const next = normalizeThumbnailFocus({
        x: f.x,
        y: f.y,
        scale: pinchRef.current.scale + delta,
      });
      flushChange(next);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchRef.current = null;
    }
  };

  const imageStyle = thumbnailFocusStyle(localFocus);

  return (
    <div
      ref={frameRef}
      role="application"
      aria-label="Drag to reposition thumbnail. Pinch or scroll to zoom."
      className={cn(
        "relative touch-none select-none overflow-hidden rounded-xl border border-white/30 bg-zinc-900/10 shadow-inner dark:bg-black/25",
        thumbnailCropFrameClass(layout),
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <MediaPreview
        mediaKey={mediaKey}
        keyPrefix="crop"
        src={imageUrl}
        alt=""
        fill
        priority
        loading="eager"
        className={cn(
          "pointer-events-none object-cover will-change-transform",
          !dragging && "transition-[object-position,transform] duration-200 ease-out",
        )}
        style={imageStyle}
        sizes={layout === "banner" ? "400px" : "200px"}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-2"
        aria-hidden
      >
        <span className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
          <Move className="h-3 w-3" />
          Drag · Scroll / pinch to zoom
        </span>
      </div>
    </div>
  );
}
