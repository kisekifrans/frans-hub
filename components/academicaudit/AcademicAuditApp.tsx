"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ApiStatusBanner } from "@/components/academicaudit/ApiStatusBanner";
import { DisclaimerBanner } from "@/components/academicaudit/DisclaimerBanner";
import { AnalysisOptions } from "@/components/academicaudit/AnalysisOptions";
import { UploadZone } from "@/components/academicaudit/UploadZone";
import { ProcessingView } from "@/components/academicaudit/ProcessingView";
import { ResultsView } from "@/components/academicaudit/ResultsView";
import { useAcademicAuditCopy } from "@/hooks/useAcademicAuditCopy";
import { submitAudit } from "@/lib/academicaudit/api";
import {
  defaultExclusionOptions,
  type AuditPhase,
  type AuditResponse,
  type ExclusionOptions,
} from "@/lib/academicaudit/types";

export function AcademicAuditApp() {
  const copy = useAcademicAuditCopy();
  const [phase, setPhase] = useState<AuditPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exclusions, setExclusions] = useState<ExclusionOptions>(
    defaultExclusionOptions,
  );

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setPhase("uploading");
    setProgress(5);
    try {
      setPhase("analyzing");
      const data = await submitAudit(file, exclusions, (pct) =>
        setProgress(pct),
      );
      setResult(data);
      setPhase("done");
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.errorGeneric);
      setPhase("error");
    }
  }, [exclusions]);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return (
    <PageShell variant="violet" contentClassName="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="glass-card mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
              aria-label={copy.backHub}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-7 w-7 text-violet-500" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                  {copy.title}
                </h1>
                <p className="text-sm font-medium text-violet-600 dark:text-violet-300">
                  {copy.subtitle}
                </p>
              </div>
            </motion.div>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              {copy.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <ApiStatusBanner />
        <div className="mb-6">
          <DisclaimerBanner />
        </div>

        <AnimatePresence mode="wait">
          {phase === "idle" || phase === "error" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <UploadZone onFile={handleFile} disabled={false} />
              <AnalysisOptions
                value={exclusions}
                onChange={setExclusions}
              />
              {error ? (
                <p className="mt-4 text-center text-sm text-rose-500">{error}</p>
              ) : null}
            </motion.div>
          ) : null}

          {phase === "uploading" || phase === "analyzing" ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProcessingView progress={progress} />
            </motion.div>
          ) : null}

          {phase === "done" && result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ResultsView result={result} onReset={reset} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
