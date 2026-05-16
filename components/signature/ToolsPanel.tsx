"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { PRESET_COLORS } from "@/lib/signature/brush";
import type { BrushStyle, CanvasBackground } from "@/lib/signature/types";
import type { useSignaturePad } from "@/hooks/useSignaturePad";
import { cn } from "@/lib/utils";

type Pad = ReturnType<typeof useSignaturePad>;

const BRUSH_STYLES: { id: BrushStyle; label: string }[] = [
  { id: "pen", label: "Pen" },
  { id: "marker", label: "Marker" },
  { id: "fountain", label: "Fountain" },
  { id: "sharp", label: "Sharp" },
];

interface ToolsPanelProps {
  pad: Pad;
}

export function ToolsPanel({ pad }: ToolsPanelProps) {
  return (
    <GlassCard
      padding="md"
      className="signature-glow border-violet-200/40 dark:border-violet-500/20"
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
        Tools
      </h2>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Brush size
            </label>
            <span className="text-xs tabular-nums text-zinc-500">
              {pad.brushSize}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            value={pad.brushSize}
            onChange={(e) => pad.setBrushSize(Number(e.target.value))}
            className="signature-slider w-full"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Brush style
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BRUSH_STYLES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pad.setBrushStyle(b.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                  pad.brushStyle === b.id
                    ? "bg-violet-500/20 text-violet-800 ring-1 ring-violet-400/50 dark:text-violet-100"
                    : "glass-card hover:bg-white/50 dark:hover:bg-white/10",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Ink color
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => pad.setColor(c.value)}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-transform hover:scale-110",
                  pad.color === c.value
                    ? "border-violet-500 ring-2 ring-violet-400/40"
                    : "border-white/60 dark:border-white/20",
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
            <label className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600">
              <span className="text-[9px] font-bold text-zinc-500">#</span>
              <input
                type="color"
                value={pad.color}
                onChange={(e) => pad.setColor(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Custom color"
              />
            </label>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Canvas background
          </p>
          <div className="flex gap-2">
            {(
              [
                { id: "transparent" as CanvasBackground, label: "Transparent" },
                { id: "paper" as CanvasBackground, label: "White paper" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pad.setBackground(opt.id)}
                className={cn(
                  "flex-1 rounded-xl px-2 py-2 text-xs font-medium transition-all",
                  pad.background === opt.id
                    ? "bg-violet-500/20 text-violet-800 ring-1 ring-violet-400/50 dark:text-violet-100"
                    : "glass-card hover:bg-white/50 dark:hover:bg-white/10",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
