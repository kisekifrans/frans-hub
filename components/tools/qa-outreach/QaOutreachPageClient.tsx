"use client";

import dynamic from "next/dynamic";
import { QaOutreachGate } from "@/components/tools/qa-outreach/QaOutreachGate";
import { PageShell } from "@/components/ui/PageShell";
import { LogOut } from "lucide-react";

const QaOutreachPanel = dynamic(
  () =>
    import("@/components/audit/outreach/QaOutreachPanel").then(
      (m) => m.QaOutreachPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Loading QA Outreach…
      </div>
    ),
  },
);

export function QaOutreachPageClient() {
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
                QA Outreach
              </h1>
              <p className="text-xs text-zinc-500">
                Atlas Capture · Productivity messages
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
          <QaOutreachPanel />
        </div>
      </PageShell>
    </QaOutreachGate>
  );
}
