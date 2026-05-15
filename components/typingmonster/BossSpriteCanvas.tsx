"use client";

import { useEffect, useRef, useState } from "react";
import {
  drawComposedFrame,
  loadCharacterData,
  preloadBossAnimations,
  type ComposedAnimation,
} from "@/lib/typingmonster/lpc-sprite-engine";
import type { BossAnimState } from "@/lib/typingmonster/types";
import { cn } from "@/lib/utils";

interface BossSpriteCanvasProps {
  animState: BossAnimState;
  hitFlash?: boolean;
  className?: string;
}

const DISPLAY_W = 280;
const DISPLAY_H = 220;
const SPRITE_SCALE = 2.8;

export function BossSpriteCanvas({
  animState,
  hitFlash,
  className,
}: BossSpriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animsRef = useRef<Partial<Record<BossAnimState, ComposedAnimation>>>({});
  const frameRef = useRef(0);
  const elapsedRef = useRef(0);
  const stateRef = useRef(animState);
  const prevStateRef = useRef(animState);
  const flashUntilRef = useRef(0);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  stateRef.current = animState;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const character = await loadCharacterData();
        const loaded = await preloadBossAnimations(character);
        if (!cancelled) {
          animsRef.current = loaded;
          setReady(Object.keys(loaded).length > 0);
          setLoadError(Object.keys(loaded).length === 0);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (prevStateRef.current !== animState) {
      frameRef.current = 0;
      elapsedRef.current = 0;
      prevStateRef.current = animState;
    }
  }, [animState]);

  useEffect(() => {
    if (hitFlash) {
      flashUntilRef.current = performance.now() + 220;
    }
  }, [hitFlash]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = DISPLAY_W * dpr;
    canvas.height = DISPLAY_H * dpr;
    canvas.style.width = `${DISPLAY_W}px`;
    canvas.style.height = `${DISPLAY_H}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const tick = (ts: number) => {
      const prev = elapsedRef.current;
      elapsedRef.current = ts;
      const dt = prev ? (ts - prev) / 1000 : 0;

      const state = stateRef.current;
      const anim = animsRef.current[state] ?? animsRef.current.idle;

      ctx.clearRect(0, 0, DISPLAY_W, DISPLAY_H);

      if (anim) {
        const frameDuration = 1 / anim.fps;
        if (dt > 0) {
          if (anim.loop) {
            frameRef.current += dt / frameDuration;
            if (frameRef.current >= anim.frameCount) {
              frameRef.current %= anim.frameCount;
            }
          } else {
            frameRef.current = Math.min(
              frameRef.current + dt / frameDuration,
              anim.frameCount - 0.01,
            );
          }
        }

        const frameIdx = Math.floor(frameRef.current);
        drawComposedFrame(
          ctx,
          anim,
          frameIdx,
          DISPLAY_W / 2,
          DISPLAY_H - 16,
          SPRITE_SCALE,
        );
      } else if (loadError || !ready) {
        drawPlaceholderBoss(ctx, DISPLAY_W, DISPLAY_H, ts, state);
      }

      const flashLeft = flashUntilRef.current - performance.now();
      if (flashLeft > 0) {
        const alpha = 0.12 * (flashLeft / 220);
        ctx.fillStyle = `rgba(244, 114, 182, ${alpha})`;
        ctx.fillRect(0, 0, DISPLAY_W, DISPLAY_H);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, loadError]);

  return (
    <div
      className={cn(
        "relative flex items-end justify-center",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="pixelated"
        aria-label="Boss sprite"
      />
      {loadError ? (
        <p className="absolute bottom-0 text-center text-[10px] text-zinc-500">
          Add LPC sheets to public/typingmonster/bosses/demonalea/standard & custom
        </p>
      ) : null}
    </div>
  );
}

function drawPlaceholderBoss(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ts: number,
  state: BossAnimState,
) {
  const bob = Math.sin(ts / 200) * 3;
  const cx = w / 2;
  const cy = h - 40 + bob;

  ctx.fillStyle = state === "hurt" ? "#fb7185" : "#a78bfa";
  ctx.fillRect(cx - 28, cy - 48, 56, 56);
  ctx.fillStyle = "#4c1d95";
  ctx.fillRect(cx - 20, cy - 72, 40, 28);
  ctx.fillStyle = "#fda4af";
  ctx.fillRect(cx - 8, cy - 64, 16, 8);

  if (state === "attack") {
    ctx.fillStyle = "#e879f9";
    ctx.fillRect(cx + 30, cy - 30, 36, 8);
  }
}
