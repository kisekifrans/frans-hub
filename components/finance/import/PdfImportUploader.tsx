"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { FINANCE_PDF_ACCEPT, FINANCE_PDF_MAX_BYTES } from "@/lib/finance/import/constants";
import type { ImportSource } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const SOURCES: { id: ImportSource; label: string }[] = [
  { id: "gopay", label: "GoPay" },
  { id: "bank", label: "Bank" },
  { id: "shopeepay", label: "ShopeePay" },
  { id: "other", label: "Generic" },
];

interface PdfImportUploaderProps {
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  onUpload: (files: File[], source: ImportSource) => void;
}

export function PdfImportUploader({
  disabled,
  uploading,
  progress = 0,
  onUpload,
}: PdfImportUploaderProps) {
  const [source, setSource] = useState<ImportSource>("gopay");
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onUpload(accepted, source);
    },
    [onUpload, source],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxSize: FINANCE_PDF_MAX_BYTES,
      multiple: true,
      disabled: disabled || uploading,
      noClick: true,
    });

  const rejectionMsg = fileRejections[0]?.errors[0]?.message;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SOURCES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={uploading}
            onClick={() => setSource(s.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              source === s.id
                ? "bg-violet-600 text-white"
                : "glass-card text-zinc-600 dark:text-zinc-300",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition",
          isDragActive
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/30 bg-white/20 dark:bg-white/5",
          (disabled || uploading) && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <input
          ref={inputRef}
          type="file"
          accept={FINANCE_PDF_ACCEPT}
          multiple
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onUpload(files, source);
            e.target.value = "";
          }}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Processing PDF… {progress}%
            </p>
            <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-white/40">
              <div
                className="h-full bg-violet-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <FileUp className="mx-auto mb-2 h-8 w-8 text-violet-500" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Drag & drop PDF statements here
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              GoPay · Bank · ShopeePay · Generic · max 25MB
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Browse PDF files
            </button>
          </>
        )}
      </div>

      {rejectionMsg ? (
        <p className="text-xs text-rose-600">{rejectionMsg}</p>
      ) : null}
    </div>
  );
}
