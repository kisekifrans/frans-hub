"use client";

import { FileUp, Loader2 } from "lucide-react";
import { CategoryManager } from "@/components/finance/categories/CategoryManager";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import { usePdfImport } from "@/lib/finance/import/usePdfImport";
import type { ImportSource } from "@/lib/finance/types";
import { formatDateId } from "@/lib/finance/format";

const SOURCES: { id: ImportSource; label: string; desc: string }[] = [
  { id: "gopay", label: "GoPay", desc: "E-wallet statement PDF" },
  { id: "bank", label: "Bank (BCA, etc.)", desc: "Bank statement PDF" },
  { id: "shopeepay", label: "ShopeePay", desc: "ShopeePay export PDF" },
  { id: "other", label: "Other", desc: "Generic statement" },
];

export function FinanceSettings() {
  const finance = useFinance();
  if (!finance) return null;

  const { importJobs, queuePdfImport, saving } = finance;
  const { ready } = usePdfImport();

  return (
    <div className="space-y-6">
      <CategoryManager />

      <GlassCard padding="md" className="space-y-4">
        <h2 className="text-sm font-semibold">PDF import (coming soon)</h2>
        <p className="text-xs text-zinc-500">
          Architecture is ready. Parser/OCR will map transactions automatically.
          For now, queue a placeholder job or use quick add.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={saving}
              onClick={() => void queuePdfImport(s.id)}
              className="glass-card flex items-start gap-3 rounded-xl p-4 text-left transition hover:bg-white/50 dark:hover:bg-white/10"
            >
              <FileUp className="mt-0.5 h-5 w-5 text-violet-500" />
              <span>
                <span className="block text-sm font-medium">{s.label}</span>
                <span className="text-xs text-zinc-500">{s.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <label className="flex cursor-not-allowed flex-col items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/20 px-4 py-8 opacity-60">
          <input type="file" accept=".pdf" disabled className="hidden" />
          <FileUp className="mb-2 h-8 w-8 text-zinc-400" />
          <span className="text-sm text-zinc-500">
            Upload UI placeholder {!ready && "(parser not ready)"}
          </span>
        </label>
      </GlassCard>

      {importJobs.length > 0 && (
        <GlassCard padding="md">
          <h2 className="mb-3 text-sm font-semibold">Import jobs</h2>
          <ul className="space-y-2 text-sm">
            {importJobs.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between rounded-lg bg-white/30 px-3 py-2 dark:bg-white/5"
              >
                <span className="capitalize">{j.source}</span>
                <span className="flex items-center gap-2 text-xs text-zinc-500">
                  {j.status === "pending" && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {j.status} · {formatDateId(j.createdAt.slice(0, 10))}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
