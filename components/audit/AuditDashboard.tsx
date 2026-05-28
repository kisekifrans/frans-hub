"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuditDashboard } from "@/hooks/useAuditDashboard";
import { AuditWorkspace } from "@/components/audit/AuditWorkspace";
import { AuditSessionHome } from "@/components/audit/AuditSessionHome";
import { QaOutreachPanel } from "@/components/audit/outreach/QaOutreachPanel";
import { PageShell } from "@/components/ui/PageShell";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuditTab = "episode" | "outreach";

export function AuditDashboard() {
  const [adminEmail, setAdminEmail] = useState("");
  const [tab, setTab] = useState<AuditTab>("episode");
  const audit = useAuditDashboard(adminEmail);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user?.email) setAdminEmail(data.user.email);
      });
  }, []);

  if (!adminEmail) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  return (
    <PageShell contentClassName="min-h-screen">
      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="glass-card rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-white/55 dark:text-zinc-300 dark:hover:bg-white/15"
            >
              ← Admin
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                QA Admin Audit
              </h1>
              <p className="text-xs text-zinc-500">
                Atlas Capture · Episode review & outreach messages
              </p>
            </div>
          </div>
        </header>

        <nav className="mb-6 flex gap-2">
          {(
            [
              { id: "episode" as const, label: "Episode audit" },
              { id: "outreach" as const, label: "QA Outreach" },
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

        {tab === "outreach" ? (
          <QaOutreachPanel />
        ) : audit.session ? (
          <AuditWorkspace audit={audit} />
        ) : (
          <AuditSessionHome audit={audit} />
        )}
      </div>
    </PageShell>
  );
}
