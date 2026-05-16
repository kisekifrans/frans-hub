"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { renderStrokes, drawStrokeOnContext } from "@/lib/signature/render";
import type { SignatureStroke } from "@/lib/signature/types";
import type { useSignaturePad } from "@/hooks/useSignaturePad";

type Pad = ReturnType<typeof useSignaturePad>;

interface SignatureCanvasProps {
  pad: Pad;
  className?: string;
}

export function SignatureCanvas({ pad, className }: SignatureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef(0);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w < 1 || h < 1) return;

    renderStrokes(ctx, pad.strokes, w, h, pad.background);

    const active = pad.getActiveStroke();
    if (active) {
      drawStrokeOnContext(ctx, active, w, h);
    }
  }, [pad]);

  const schedulePaint = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(paint);
  }, [paint]);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w < 1 || h < 1) return;

    sizeRef.current = { w, h };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    schedulePaint();
  }, [schedulePaint]);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    schedulePaint();
  }, [pad.strokes, pad.background, schedulePaint]);

  const normFromEvent = useCallback(
    (clientX: number, clientY: number, pressure?: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect?.width || !rect?.height) return null;
      return {
        x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
        pressure,
      };
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;
      container.setPointerCapture(e.pointerId);
      e.preventDefault();
      const n = normFromEvent(e.clientX, e.clientY, e.pressure);
      if (!n) return;
      pad.startStroke(n.x, n.y, n.pressure);
      schedulePaint();
    },
    [normFromEvent, pad, schedulePaint],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pad.isDrawing()) return;
      e.preventDefault();
      const n = normFromEvent(e.clientX, e.clientY, e.pressure);
      if (!n) return;
      pad.extendStroke(n.x, n.y, n.pressure);
      schedulePaint();
    },
    [normFromEvent, pad, schedulePaint],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pad.isDrawing()) return;
      e.preventDefault();
      pad.endStroke();
      schedulePaint();
    },
    [pad, schedulePaint],
  );

  const onPointerCancel = useCallback(() => {
    pad.endStroke();
    schedulePaint();
  }, [pad, schedulePaint]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "signature-canvas-wrap relative min-h-[220px] w-full touch-none select-none",
        "aspect-[5/3] sm:aspect-[16/9] sm:min-h-[280px]",
        className,
      )}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl transition-colors duration-300",
          pad.background === "paper"
            ? "bg-white shadow-inner"
            : "bg-[repeating-conic-gradient(rgba(120,100,140,0.12)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(rgba(255,255,255,0.06)_0%_25%,transparent_0%_50%)]",
        )}
        aria-hidden
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair rounded-xl"
        aria-label="Signature drawing canvas"
      />
      {pad.strokes.length === 0 && !pad.isDrawing() ? (
        <p className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
          Draw your signature here
        </p>
      ) : null}
    </div>
  );
}
