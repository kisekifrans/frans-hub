"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenLine } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignatureCanvas } from "@/components/signature/SignatureCanvas";
import { ToolsPanel } from "@/components/signature/ToolsPanel";
import { ActionBar } from "@/components/signature/ActionBar";
import { ExportPreviewModal } from "@/components/signature/ExportPreviewModal";
import { useSignaturePad } from "@/hooks/useSignaturePad";
import {
  exportSignature,
  revokeExportUrl,
} from "@/lib/signature/export";
import type { ExportFormat, ExportResult } from "@/lib/signature/types";

const CANVAS_LOGICAL = { w: 800, h: 450 };

export function SignatureWorkspace() {
  const pad = useSignaturePad();
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportUrlRef = useRef<string | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (pad.strokes.length === 0) return;
      setExporting(true);
      try {
        if (exportUrlRef.current) {
          revokeExportUrl(exportUrlRef.current);
          exportUrlRef.current = null;
        }
        const result = await exportSignature(
          pad.strokes,
          CANVAS_LOGICAL.w,
          CANVAS_LOGICAL.h,
          format,
        );
        exportUrlRef.current = result.url;
        setExportResult(result);
      } finally {
        setExporting(false);
      }
    },
    [pad.strokes],
  );

  const closeExport = useCallback(() => {
    if (exportUrlRef.current) {
      revokeExportUrl(exportUrlRef.current);
      exportUrlRef.current = null;
    }
    setExportResult(null);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = prev;
    };
  }, []);

  return (
    <PageShell variant="rose" contentClassName="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="glass-card mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
              aria-label="Back to hub"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <PenLine className="h-6 w-6 text-violet-500" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                Signature Studio
              </h1>
            </motion.div>
            <p className="mt-2 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
              Draw your real signature with mouse, finger, or stylus. Export as
              PNG or SVG for documents and forms.
            </p>
          </div>

          <AnimatePresence>
            {pad.draftSaved ? (
              <motion.p
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-full px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                Draft saved locally
              </motion.p>
            ) : pad.restored && pad.strokes.length > 0 ? (
              <p className="text-xs text-zinc-500">Restored from last session</p>
            ) : null}
          </AnimatePresence>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:gap-6">
          <GlassCard
            padding="sm"
            className="signature-glow order-1 overflow-hidden border-violet-200/35 dark:border-violet-500/15"
          >
            <SignatureCanvas pad={pad} />
          </GlassCard>

          <div className="order-2 flex flex-col gap-4 lg:order-2">
            <ToolsPanel pad={pad} />
            <ActionBar
              pad={pad}
              onExport={handleExport}
              exporting={exporting}
            />
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-zinc-500">
          Your signature stays on this device until you clear it or export.
        </p>
      </div>

      <ExportPreviewModal result={exportResult} onClose={closeExport} />
    </PageShell>
  );
}
