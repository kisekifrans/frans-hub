"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { EdgeCaseVideoPlayer } from "@/components/edgecases/EdgeCaseVideoPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import type { EdgeCase } from "@/lib/edgecases/types";

interface EdgeCaseVideoModalProps {
  item: EdgeCase | null;
  onClose: () => void;
}

export function EdgeCaseVideoModal({ item, onClose }: EdgeCaseVideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playSession, setPlaySession] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item) {
      setPlayerReady(false);
      setPlaybackError(null);
      return;
    }
    setPlaybackError(null);
    setPlaySession((s) => s + 1);
    setPlayerReady(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlayerReady(true));
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      setPlayerReady(false);
    };
  }, [item?.id, item?.videoUrl, onClose]);

  if (!mounted) return null;

  const videoUrl = item?.videoUrl?.trim() ?? "";
  const hasVideo = Boolean(videoUrl);

  return createPortal(
    <AnimatePresence>
      {item ? (
        <motion.div
          className="fixed inset-0 z-[220] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            aria-label="Close video"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-4xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Video: ${item.title}`}
          >
            <GlassCard padding="md" className="overflow-hidden">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {item.projectName ?? "—"}
                    {item.episodeId ? ` · ${item.episodeId}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-zinc-500 hover:bg-white/40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!hasVideo ? (
                <div className="flex aspect-video min-h-[200px] items-center justify-center rounded-xl bg-zinc-900/80 px-4 text-center text-sm text-zinc-400">
                  No uploaded video — edit this edge case and upload a file.
                </div>
              ) : playerReady ? (
                <>
                  {playbackError ? (
                    <p className="mb-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">
                      {playbackError}
                    </p>
                  ) : null}
                  <EdgeCaseVideoPlayer
                    edgeCaseId={item.id}
                    videoUrl={videoUrl}
                    mimeType={item.mimeType}
                    playSession={playSession}
                    onPlaybackError={setPlaybackError}
                  />
                </>
              ) : (
                <div className="aspect-video w-full animate-pulse rounded-xl bg-zinc-900/80" />
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
