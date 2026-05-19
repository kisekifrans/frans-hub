"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { EdgeCaseVideoUpload } from "@/components/edgecases/EdgeCaseVideoUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  buildQaUrlFromEpisodeId,
  parseEpisodeIdFromQaInput,
} from "@/lib/edgecases/atlas-parse";
import { getAtlasReviewUrl } from "@/lib/audit/atlas";
import type {
  EdgeCase,
  EdgeCaseDecision,
  EdgeCaseInput,
  EdgeCaseMediaUploadResult,
} from "@/lib/edgecases/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 dark:bg-white/5 dark:border-white/10";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function emptyForm(): EdgeCaseInput {
  return {
    title: "",
    description: "",
    episodeId: "",
    qaUrl: "",
    uploadedVideoPath: "",
    thumbnailPath: "",
    projectName: "",
    taskId: "",
    taskDescription: "",
    decision: undefined,
    rejectReason: "",
    tags: [],
    notes: "",
  };
}

interface EdgeCaseFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: EdgeCase | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    input: EdgeCaseInput,
    existing?: EdgeCase,
    createId?: string,
  ) => Promise<void>;
}

export function EdgeCaseFormModal({
  open,
  mode,
  initial,
  saving,
  onClose,
  onSubmit,
}: EdgeCaseFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [draftId] = useState(() => crypto.randomUUID());
  const edgeCaseId = mode === "edit" && initial ? initial.id : draftId;

  const [form, setForm] = useState<EdgeCaseInput>(emptyForm);
  const [tagsRaw, setTagsRaw] = useState("");
  const [qaPaste, setQaPaste] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | undefined>();
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | undefined>();

  const hasVideo = Boolean(form.uploadedVideoPath?.trim());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        episodeId: initial.episodeId ?? "",
        qaUrl: initial.qaUrl ?? "",
        uploadedVideoPath: initial.uploadedVideoPath ?? "",
        thumbnailPath: initial.thumbnailPath ?? "",
        projectName: initial.projectName ?? "",
        taskId: initial.taskId ?? "",
        taskDescription: initial.taskDescription ?? "",
        title: initial.title,
        description: initial.description,
        decision: initial.decision,
        rejectReason: initial.rejectReason ?? "",
        tags: initial.tags,
        notes: initial.notes ?? "",
        durationSeconds: initial.durationSeconds,
        fileSize: initial.fileSize,
        mimeType: initial.mimeType,
      });
      setTagsRaw(initial.tags.join(", "));
      setQaPaste(initial.qaUrl ?? buildQaUrlFromEpisodeId(initial.episodeId));
      setVideoPreviewUrl(initial.videoUrl);
      setThumbPreviewUrl(initial.thumbnailUrl);
    } else {
      setForm(emptyForm());
      setTagsRaw("");
      setQaPaste("");
      setVideoPreviewUrl(undefined);
      setThumbPreviewUrl(undefined);
    }
  }, [open, mode, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const qaExternal = useMemo(
    () => getAtlasReviewUrl(form.episodeId) ?? form.qaUrl,
    [form.episodeId, form.qaUrl],
  );

  const applyQaPaste = () => {
    const episodeId = parseEpisodeIdFromQaInput(qaPaste);
    if (!episodeId) return;
    const qaUrl = qaPaste.trim().startsWith("http")
      ? qaPaste.trim()
      : buildQaUrlFromEpisodeId(episodeId);
    setForm((f) => ({
      ...f,
      episodeId,
      qaUrl,
      title: f.title.trim() || `Edge case ${episodeId.slice(0, 8)}…`,
    }));
  };

  const onMediaUploaded = useCallback((result: EdgeCaseMediaUploadResult) => {
    setForm((f) => ({
      ...f,
      uploadedVideoPath: result.uploadedVideoPath || f.uploadedVideoPath,
      thumbnailPath: result.thumbnailPath || f.thumbnailPath,
      durationSeconds: result.durationSeconds ?? f.durationSeconds,
      fileSize: result.fileSize || f.fileSize,
      mimeType: result.mimeType || f.mimeType,
    }));
    if (result.videoUrl) setVideoPreviewUrl(result.videoUrl);
    if (result.thumbnailUrl) setThumbPreviewUrl(result.thumbnailUrl);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!hasVideo) {
      toast.error("Upload a video before saving");
      return;
    }
    const payload: EdgeCaseInput = {
      ...form,
      title: form.title.trim(),
      tags: parseTags(tagsRaw),
    };
    await onSubmit(
      payload,
      mode === "edit" ? initial ?? undefined : undefined,
      mode === "create" ? edgeCaseId : undefined,
    );
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[210] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden sm:rounded-2xl"
          >
            <GlassCard
              padding="lg"
              className="max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {mode === "create" ? "Add edge case" : "Edit edge case"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={(e) => void submit(e)} className="space-y-3">
                <EdgeCaseVideoUpload
                  edgeCaseId={edgeCaseId}
                  currentVideoUrl={videoPreviewUrl}
                  currentThumbnailUrl={thumbPreviewUrl}
                  disabled={saving}
                  onUploadingChange={setUploading}
                  onUploaded={onMediaUploaded}
                />

                <div className="rounded-xl border border-dashed border-white/30 p-3">
                  <label className="text-xs font-medium text-zinc-500">
                    QA review URL (reference only)
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <input
                      className={cn(inputClass, "min-w-0 flex-1")}
                      value={qaPaste}
                      onChange={(e) => setQaPaste(e.target.value)}
                      placeholder="https://qa.atlascapture.io/review/…"
                    />
                    <button
                      type="button"
                      onClick={applyQaPaste}
                      className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-sm text-white"
                    >
                      Parse
                    </button>
                    {qaExternal ? (
                      <a
                        href={qaExternal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1 rounded-xl border border-white/30 px-3 py-2 text-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open QA
                      </a>
                    ) : null}
                  </div>
                </div>

                <input
                  className={inputClass}
                  placeholder="Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <textarea
                  className={cn(inputClass, "min-h-[60px] resize-none")}
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <select
                  className={inputClass}
                  value={form.decision ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      decision: (e.target.value || undefined) as
                        | EdgeCaseDecision
                        | undefined,
                    })
                  }
                >
                  <option value="">Decision</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="pending">Pending</option>
                </select>

                <textarea
                  className={cn(inputClass, "min-h-[56px] resize-none")}
                  placeholder="Reject reason"
                  value={form.rejectReason ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, rejectReason: e.target.value })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Tags (comma separated)"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                />

                <div className="rounded-xl border border-white/20">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((o) => !o)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300"
                  >
                    Advanced metadata
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition",
                        advancedOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {advancedOpen ? (
                    <div className="space-y-2 border-t border-white/15 p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Episode ID"
                          value={form.episodeId ?? ""}
                          onChange={(e) =>
                            setForm({ ...form, episodeId: e.target.value })
                          }
                        />
                        <input
                          className={inputClass}
                          placeholder="Project"
                          value={form.projectName ?? ""}
                          onChange={(e) =>
                            setForm({ ...form, projectName: e.target.value })
                          }
                        />
                      </div>
                      <input
                        className={inputClass}
                        placeholder="Task ID"
                        value={form.taskId ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, taskId: e.target.value })
                        }
                      />
                      <textarea
                        className={cn(inputClass, "min-h-[56px] resize-none")}
                        placeholder="Task description"
                        value={form.taskDescription ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            taskDescription: e.target.value,
                          })
                        }
                      />
                      <input
                        className={inputClass}
                        placeholder="Notes"
                        value={form.notes ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                      />
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="glass-card flex-1 rounded-xl py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      saving || uploading || !form.title.trim() || !hasVideo
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
