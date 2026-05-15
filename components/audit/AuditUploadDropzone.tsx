"use client";

import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditUploadDropzoneProps {
  uploading: boolean;
  onFile: (file: File) => void;
}

export function AuditUploadDropzone({
  uploading,
  onFile,
}: AuditUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) return;
      onFile(file);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "glass-card flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
        dragOver
          ? "border-violet-400 bg-violet-500/10"
          : "border-violet-300/40 hover:border-violet-400/60 hover:bg-white/30 dark:hover:bg-white/5",
        uploading && "pointer-events-none opacity-70",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploading ? (
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
          <Upload className="h-7 w-7 text-violet-600 dark:text-violet-300" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Drop CSV or click to upload
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Production review export (.csv)
        </p>
      </div>
    </div>
  );
}
