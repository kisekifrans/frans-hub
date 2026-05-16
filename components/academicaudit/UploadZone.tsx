"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FileText, Upload } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { copy } from "@/lib/academicaudit/copy";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  progress?: number;
}

export function UploadZone({ onFile, disabled, progress }: UploadZoneProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: 12 * 1024 * 1024,
      disabled,
    });

  const rejectMsg = fileRejections[0]?.errors[0]?.message;

  return (
    <GlassCard
      padding="lg"
      className={cn(
        "signature-glow transition-all duration-300",
        isDragActive && "ring-2 ring-violet-400/50",
      )}
    >
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all",
          isDragActive
            ? "border-violet-400 bg-violet-500/10"
            : "border-violet-300/40 hover:border-violet-400/60 hover:bg-white/30 dark:border-violet-500/25 dark:hover:bg-white/5",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20"
        >
          <Upload className="h-8 w-8 text-violet-500" />
        </motion.div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {copy.uploadTitle}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          {copy.uploadHint}
        </p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <FileText className="h-3.5 w-3.5" />
          {copy.uploadLimit}
        </p>
        {rejectMsg ? (
          <p className="mt-3 text-xs text-rose-500">{rejectMsg}</p>
        ) : null}
        {progress != null && progress > 0 && progress < 100 ? (
          <motion.div className="mt-6 w-full max-w-xs">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-black/30">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        ) : null}
      </div>
    </GlassCard>
  );
}
