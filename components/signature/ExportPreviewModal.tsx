"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ExportResult } from "@/lib/signature/types";

interface ExportPreviewModalProps {
  result: ExportResult | null;
  onClose: () => void;
}

export function ExportPreviewModal({ result, onClose }: ExportPreviewModalProps) {
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, onClose]);

  const download = () => {
    if (!result) return;
    const ext = result.format === "svg" ? "svg" : "png";
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `signature.${ext}`;
    a.click();
  };

  return (
    <AnimatePresence>
      {result ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/45 backdrop-blur-sm"
            aria-label="Close export preview"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
          >
            <GlassCard padding="lg" className="signature-glow text-center">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <p
                id="export-title"
                className="text-sm font-medium text-violet-600 dark:text-violet-300"
              >
                Export ready
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                {result.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {result.width} × {result.height}px · high quality
              </p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="mx-auto mt-5 flex min-h-[120px] max-h-[200px] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-[repeating-conic-gradient(rgba(120,100,140,0.1)_0%_25%,transparent_0%_50%)] bg-[length:12px_12px] p-4 dark:bg-[repeating-conic-gradient(rgba(255,255,255,0.05)_0%_25%,transparent_0%_50%)]"
              >
                {result.format === "svg" ? (
                  <img
                    src={result.url}
                    alt="Signature export preview"
                    className="max-h-[160px] max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={result.url}
                    alt="Signature export preview"
                    className="max-h-[160px] max-w-full object-contain drop-shadow-md"
                  />
                )}
              </motion.div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={download}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30"
              >
                <Download className="h-4 w-4" />
                Download file
              </motion.button>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
