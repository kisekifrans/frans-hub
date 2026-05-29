"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QaOutreachGate } from "@/components/tools/qa-outreach/QaOutreachGate";
import { PageShell } from "@/components/ui/PageShell";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const QaOutreachPanel = dynamic(
  () =>
    import("@/components/audit/outreach/QaOutreachPanel").then(
      (m) => m.QaOutreachPanel,
    ),
  { ssr: false, loading: () => <TabLoader label="Outreach" /> },
);

const QaReviewStatsPanel = dynamic(
  () =>
    import("@/components/audit/review-stats/QaReviewStatsPanel").then(
      (m) => m.QaReviewStatsPanel,
    ),
  { ssr: false, loading: () => <TabLoader label="Review Stats" /> },
);

type QaTab = "outreach" | "stats";

function TabLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
      Loading {label}…
    </div>
  );
}

export function QaOutreachPageClient() {
  const [tab, setTab] = useState<QaTab>("outreach");

  const handleLock = async () => {
    await fetch("/api/tools/qa-outreach/auth", {
      method: "DELETE",
      credentials: "include",
    });
    window.location.reload();
  };

  return (
    <QaOutreachGate>
      <PageShell contentClassName="min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:py-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                QA Tools
              </h1>
              <p className="text-xs text-zinc-500">
                Atlas Capture · Outreach & review analytics
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLock()}
              className="glass-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-white/55 dark:text-zinc-300 dark:hover:bg-white/15"
            >
              <LogOut className="h-3.5 w-3.5" />
              Lock
            </button>
          </header>

          <nav className="mb-6 flex gap-2">
            {(
              [
                { id: "outreach" as const, label: "Outreach Messages" },
                { id: "stats" as const, label: "Review Stats" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                    : "glass-card text-zinc-600 dark:text-zinc-300",
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "outreach" ? <QaOutreachPanel /> : <QaReviewStatsPanel />}
        </div>
      </PageShell>
    </QaOutreachGate>
  );
}
