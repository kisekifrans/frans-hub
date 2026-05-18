"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FinanceNav } from "@/components/finance/layout/FinanceNav";
import { QuickAddFab } from "@/components/finance/layout/QuickAddFab";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageShell } from "@/components/ui/PageShell";
import { FinanceProvider, FinanceLoadingGate } from "@/hooks/useFinance";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { QuickAddProvider } from "@/components/finance/layout/QuickAddContext";

export function FinanceShell({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <QuickAddProvider>
        <PageShell variant="violet">
          <div className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/id/admin"
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Personal Finance
                  </h1>
                  <p className="text-xs text-zinc-500">Private · agisna.dev</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </header>
            <FinanceNav />
            <div className="mt-6">
              <FinanceLoadingGate>
                {children}
                <QuickAddFab />
              </FinanceLoadingGate>
            </div>
          </div>
        </PageShell>
      </QuickAddProvider>
    </FinanceProvider>
  );
}
