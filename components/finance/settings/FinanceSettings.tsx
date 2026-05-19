"use client";

import { useCallback, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { CategoryManager } from "@/components/finance/categories/CategoryManager";
import { ImportPreviewModal } from "@/components/finance/import/ImportPreviewModal";
import { PdfImportUploader } from "@/components/finance/import/PdfImportUploader";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import type { ImportPreviewRow } from "@/lib/finance/import/types";
import type { ImportSource } from "@/lib/finance/types";
import { formatDateId } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  processing: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function FinanceSettings() {
  const finance = useFinance();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [previewFilename, setPreviewFilename] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (files: File[], source: ImportSource) => {
      if (!finance) return;
      for (const file of files) {
        setUploadProgress(0);
        const result = await finance.processPdfImport(file, source, setUploadProgress);
        if (result && result.rows.length > 0) {
          setPreviewRows(result.rows);
          setPreviewErrors(result.errors);
          setPreviewFilename(file.name);
          setActiveJobId(result.job.id);
          setPreviewOpen(true);
          break;
        }
      }
    },
    [finance],
  );

  const handleConfirm = useCallback(
    async (rows: ImportPreviewRow[]) => {
      if (!finance || !activeJobId) return;
      await finance.confirmPdfImport(activeJobId, rows);
      setPreviewOpen(false);
      setActiveJobId(null);
    },
    [finance, activeJobId],
  );

  const handleRetry = useCallback(
    async (jobId: string) => {
      if (!finance) return;
      const job = finance.importJobs.find((j) => j.id === jobId);
      setUploadProgress(0);
      const result = await finance.retryImportJob(jobId, setUploadProgress);
      if (result && result.rows.length > 0) {
        setPreviewRows(result.rows);
        setPreviewErrors(result.errors);
        setPreviewFilename(job?.originalFilename ?? "statement.pdf");
        setActiveJobId(jobId);
        setPreviewOpen(true);
      }
    },
    [finance],
  );

  if (!finance) return null;

  const { importJobs, saving, categories, paymentMethods, periods } = finance;
  const uploading = saving && uploadProgress > 0 && uploadProgress < 100;

  return (
    <div className="space-y-6">
      <CategoryManager />

      <GlassCard padding="md" className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Import from PDF</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Upload GoPay, bank, ShopeePay, or generic statements. Text is extracted
            locally — OCR coming later.
          </p>
        </div>

        <PdfImportUploader
          disabled={saving}
          uploading={uploading || (saving && !previewOpen)}
          progress={uploadProgress}
          onUpload={(files, source) => void handleUpload(files, source)}
        />
      </GlassCard>

      {importJobs.length > 0 && (
        <GlassCard padding="md">
          <h2 className="mb-3 text-sm font-semibold">Import jobs</h2>
          <ul className="space-y-2 text-sm">
            {importJobs.map((j) => (
              <li
                key={j.id}
                className="flex flex-col gap-2 rounded-lg bg-white/30 px-3 py-2 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium capitalize">
                    {j.originalFilename ?? j.source}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDateId(j.createdAt.slice(0, 10))} ·{" "}
                    {j.extractedCount} extracted
                    {j.completedAt
                      ? ` · imported ${formatDateId(j.completedAt.slice(0, 10))}`
                      : ""}
                  </p>
                  {j.errorMessage ? (
                    <p className="mt-0.5 text-xs text-rose-600">{j.errorMessage}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      STATUS_STYLES[j.status] ?? STATUS_STYLES.pending,
                    )}
                  >
                    {j.status}
                  </span>
                  {j.status === "failed" || j.status === "processing" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleRetry(j.id)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/40"
                      title="Retry parse"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void finance.removeImportJob(j.id)}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-600"
                    title="Delete job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <ImportPreviewModal
        open={previewOpen}
        filename={previewFilename}
        rows={previewRows}
        categories={categories}
        paymentMethods={paymentMethods}
        periods={periods}
        errors={previewErrors}
        importing={saving}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
