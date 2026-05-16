"use client";

import { motion } from "framer-motion";
import { Download, FileCheck2, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ParagraphCard } from "@/components/academicaudit/ParagraphCard";
import { copy } from "@/lib/academicaudit/copy";
import { formatPercent, levelMeta } from "@/lib/academicaudit/levels";
import { downloadReportUrl } from "@/lib/academicaudit/api";
import type { AuditResponse } from "@/lib/academicaudit/types";

interface ResultsViewProps {
  result: AuditResponse;
  onReset: () => void;
}

export function ResultsView({ result, onReset }: ResultsViewProps) {
  const { summary } = result;

  return (
    <div className="space-y-6">
      <GlassCard padding="lg" className="signature-glow">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {copy.summaryTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{result.filename}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox
            label={copy.avgScore}
            value={formatPercent(summary.average_score)}
            accent="violet"
          />
          <StatBox
            label={copy.high}
            value={String(summary.high_count)}
            accent="rose"
          />
          <StatBox
            label={copy.medium}
            value={String(summary.medium_count)}
            accent="amber"
          />
          <StatBox
            label={copy.low}
            value={String(summary.low_count)}
            accent="emerald"
          />
        </div>

        {result.truncated ? (
          <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
            {copy.truncated}
          </p>
        ) : null}

        <motion.div className="mt-6 flex flex-wrap gap-3">
          <a
            href={downloadReportUrl(result.session_id)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            {copy.download}
          </a>
          <button
            type="button"
            onClick={onReset}
            className="glass-card inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-white/55 dark:hover:bg-white/12"
          >
            <RefreshCw className="h-4 w-4" />
            {copy.newDoc}
          </button>
        </motion.div>

        <p className="mt-4 flex items-start gap-2 text-[11px] text-zinc-500">
          <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {result.disclaimer}
        </p>
      </GlassCard>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
          {copy.paragraphs}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {result.paragraphs.map((p, i) => (
            <ParagraphCard key={p.index} paragraph={p} index={i} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        <LegendSwatch level="high" />
        <LegendSwatch level="medium" />
        <LegendSwatch level="low" />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "violet" | "rose" | "amber" | "emerald";
}) {
  const ring = {
    violet: "from-violet-500/20 to-fuchsia-500/10",
    rose: "from-rose-500/20 to-rose-500/5",
    amber: "from-amber-500/20 to-amber-500/5",
    emerald: "from-emerald-500/20 to-emerald-500/5",
  }[accent];

  return (
    <div
      className={`rounded-xl border border-white/20 bg-gradient-to-br ${ring} p-4`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function LegendSwatch({ level }: { level: "high" | "medium" | "low" }) {
  const meta = levelMeta[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 ${meta.bg} ${meta.border} ${meta.color}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {meta.label}
    </span>
  );
}
