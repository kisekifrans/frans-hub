"use client";

import { motion } from "framer-motion";
import {
  Download,
  Eraser,
  FileImage,
  FileCode2,
  Redo2,
  Undo2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ExportFormat } from "@/lib/signature/types";
import type { useSignaturePad } from "@/hooks/useSignaturePad";
import { cn } from "@/lib/utils";

type Pad = ReturnType<typeof useSignaturePad>;

interface ActionBarProps {
  pad: Pad;
  onExport: (format: ExportFormat) => void;
  exporting?: boolean;
}

function ToolButton({
  children,
  onClick,
  disabled,
  title,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  variant?: "default" | "primary" | "danger";
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 disabled:opacity-40",
        variant === "primary" &&
          "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:brightness-110",
        variant === "danger" &&
          "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
        variant === "default" &&
          "glass-card hover:bg-white/55 dark:hover:bg-white/12",
      )}
    >
      {children}
    </button>
  );
}

export function ActionBar({ pad, onExport, exporting }: ActionBarProps) {
  return (
    <GlassCard padding="md" className="signature-glow">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <ToolButton
            title="Undo"
            disabled={!pad.canUndo}
            onClick={pad.undo}
          >
            <Undo2 className="h-4 w-4" />
            <span className="hidden sm:inline">Undo</span>
          </ToolButton>
          <ToolButton
            title="Redo"
            disabled={!pad.canRedo}
            onClick={pad.redo}
          >
            <Redo2 className="h-4 w-4" />
            <span className="hidden sm:inline">Redo</span>
          </ToolButton>
          <ToolButton
            title="Clear canvas"
            variant="danger"
            onClick={pad.clear}
          >
            <Eraser className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </ToolButton>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent dark:via-violet-500/30" />

        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Export
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <ToolButton
            title="PNG transparent"
            variant="primary"
            disabled={exporting || pad.strokes.length === 0}
            onClick={() => onExport("png-transparent")}
          >
            <FileImage className="h-4 w-4" />
            PNG
          </ToolButton>
          <ToolButton
            title="PNG white background"
            variant="primary"
            disabled={exporting || pad.strokes.length === 0}
            onClick={() => onExport("png-white")}
          >
            <Download className="h-4 w-4" />
            PNG + paper
          </ToolButton>
          <ToolButton
            title="Export SVG"
            variant="primary"
            disabled={exporting || pad.strokes.length === 0}
            onClick={() => onExport("svg")}
          >
            <FileCode2 className="h-4 w-4" />
            SVG
          </ToolButton>
        </div>
      </div>
    </GlassCard>
  );
}
