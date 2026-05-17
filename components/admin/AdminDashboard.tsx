"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BlocksManager } from "@/components/admin/BlocksManager";
import { GearManager } from "@/components/admin/gear/GearManager";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageShell } from "@/components/ui/PageShell";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { SocialLinksEditor } from "@/components/admin/SocialLinksEditor";
import { ThemePicker } from "@/components/profile/ThemePicker";
import type { AnalyticsGranularity, AnalyticsPeriod } from "@/lib/types";
import { useHub } from "@/hooks/useHub";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const {
    profile,
    profileId,
    analytics,
    loading,
    saving,
    saveProfileFields,
    addBlock,
    patchBlock,
    removeBlock,
    reorder,
    refreshAnalytics,
  } = useHub();

  const [tab, setTab] = useState<
    "analytics" | "blocks" | "profile" | "gear"
  >("analytics");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const handlePeriodChange = useCallback(
    async (period: AnalyticsPeriod, granularity: AnalyticsGranularity) => {
      setAnalyticsLoading(true);
      await refreshAnalytics(period, granularity);
      setAnalyticsLoading(false);
    },
    [refreshAnalytics],
  );

  if (loading || !profile || !profileId || !analytics) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  const blocks = profile.blocks;

  return (
    <PageShell>
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="glass-card flex h-10 w-10 items-center justify-center rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-sm text-zinc-500">
                {saving ? "Saving…" : "Synced with Supabase"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/audit"
              className="glass-card rounded-full px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-white/55 dark:text-violet-300 dark:hover:bg-white/15"
            >
              QA Admin Audit
            </Link>
            <Link
              href="/tools/quickreply"
              className="glass-card rounded-full px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-white/55 dark:text-violet-300 dark:hover:bg-white/15"
            >
              Quick Reply
            </Link>
            <Link
              href="/gear"
              className="glass-card rounded-full px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-white/55 dark:text-violet-300 dark:hover:bg-white/15"
            >
              Gear
            </Link>
            <ThemeToggle />
            <LogoutButton />
            <button
              type="button"
              onClick={() => refreshAnalytics()}
              className="rounded-full px-3 py-1.5 text-xs text-zinc-500 underline"
            >
              Refresh stats
            </button>
          </div>
        </header>

        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {(["analytics", "blocks", "gear", "profile"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition",
                tab === t
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                  : "glass-card text-zinc-600 dark:text-zinc-300",
              )}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === "analytics" && (
          <AnalyticsPanel
            stats={analytics}
            loading={analyticsLoading}
            onPeriodChange={handlePeriodChange}
          />
        )}

        {tab === "profile" && (
          <GlassCard padding="lg" className="max-w-xl space-y-4">
            <ProfileField
              label="Display name"
              value={profile.displayName}
              onBlur={(v) => saveProfileFields({ displayName: v })}
            />
            <ProfileField
              label="Username"
              value={profile.username}
              onBlur={(v) => saveProfileFields({ username: v })}
            />
            <ProfileField
              label="Bio"
              value={profile.bio}
              onBlur={(v) => saveProfileFields({ bio: v })}
            />
            <MediaUpload
              profileId={profileId}
              blockId="avatar"
              folder="avatars"
              label="Avatar"
              currentUrl={profile.avatarUrl}
              storagePath={profile.avatarStoragePath}
              onUploaded={(url, storagePath) =>
                saveProfileFields({ avatarUrl: url, avatarStoragePath: storagePath })
              }
            />
            <SocialLinksEditor
              links={profile.socialLinks}
              onChange={(socialLinks) => saveProfileFields({ socialLinks })}
            />
            <ThemePicker
              value={profile.theme}
              onChange={(theme) => saveProfileFields({ theme })}
            />
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={profile.verified}
                onChange={(e) =>
                  saveProfileFields({ verified: e.target.checked })
                }
                className="rounded border-white/30"
              />
              Show verified creator badge
            </label>
          </GlassCard>
        )}

        {tab === "blocks" && (
          <BlocksManager
            profileId={profileId}
            blocks={blocks}
            saving={saving}
            onAdd={addBlock}
            onPatch={patchBlock}
            onRemove={removeBlock}
            onReorder={reorder}
          />
        )}

        {tab === "gear" && <GearManager />}
      </div>
    </PageShell>
  );
}

function ProfileField({
  label,
  value,
  onBlur,
}: {
  label: string;
  value: string;
  onBlur: (v: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
      {label}
      <input
        type="text"
        defaultValue={value}
        key={`${label}-${value}`}
        onBlur={(e) => onBlur(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
      />
    </label>
  );
}
