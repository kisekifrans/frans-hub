"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/utils";

interface QaOutreachGateProps {
  children: React.ReactNode;
}

export function QaOutreachGate({ children }: QaOutreachGateProps) {
  const [status, setStatus] = useState<"loading" | "locked" | "unlocked">(
    "loading",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/tools/qa-outreach/session", {
        credentials: "include",
      });
      const data = (await res.json()) as { authenticated?: boolean };
      setStatus(data.authenticated ? "unlocked" : "locked");
    } catch {
      setStatus("locked");
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/tools/qa-outreach/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          res.status === 401
            ? "Incorrect password"
            : data.error || "Could not unlock. Try again.",
        );
        setPassword("");
        return;
      }
      setPassword("");
      setStatus("unlocked");
    } catch {
      setError("Could not verify password. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  if (status === "locked") {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center px-4">
        <GlassCard padding="lg" className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-violet-500" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
              QA Outreach
            </h1>
          </div>
          <p className="text-sm text-zinc-500">
            Team access only. Enter the shared password to continue.
          </p>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
            <label className="block space-y-1 text-xs text-zinc-500">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-card w-full rounded-lg border-0 px-3 py-2.5 text-sm text-zinc-900 dark:text-white"
                placeholder="••••••••"
                disabled={submitting}
              />
            </label>
            {error ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition",
                "hover:bg-violet-500 disabled:opacity-50",
              )}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Unlock
            </button>
          </form>
        </GlassCard>
      </PageShell>
    );
  }

  return <>{children}</>;
}
