"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Link2,
  Loader2,
  MousePointerClick,
} from "lucide-react";
import { BlocksManager } from "@/components/admin/BlocksManager";
import { MiniChart } from "@/components/analytics/MiniChart";
import { StatCard } from "@/components/analytics/StatCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageShell } from "@/components/ui/PageShell";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { ctr, getLast7Days } from "@/lib/analytics";
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

  const [tab, setTab] = useState<"blocks" | "analytics" | "profile">("analytics");

  if (loading || !profile || !profileId || !analytics) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  const days = getLast7Days();
  const viewValues = days.map((d) => analytics.viewsByDay[d] ?? 0);
  const clickValues = days.map((d) => analytics.clicksByDay[d] ?? 0);
  const dayLabels = days.map((d) => d.slice(5));
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
          {(["analytics", "blocks", "profile"] as const).map((t) => (
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCard
                label="Total views"
                value={analytics.totalViews.toLocaleString()}
                icon={Eye}
                accent="violet"
              />
              <StatCard
                label="Link clicks"
                value={analytics.totalClicks.toLocaleString()}
                icon={MousePointerClick}
                accent="cyan"
              />
              <StatCard
                label="Click-through rate"
                value={`${ctr(analytics)}%`}
                icon={BarChart3}
                accent="rose"
              />
              <StatCard
                label="Active blocks"
                value={blocks.filter((b) => b.enabled).length}
                icon={Link2}
                accent="emerald"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <MiniChart
                title="Views (last 7 days)"
                labels={dayLabels}
                values={viewValues}
                color="bg-violet-500"
              />
              <MiniChart
                title="Clicks (last 7 days)"
                labels={dayLabels}
                values={clickValues}
                color="bg-cyan-500"
              />
            </div>
          </div>
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
              onUploaded={(url) => saveProfileFields({ avatarUrl: url })}
            />
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Theme accent
              <select
                value={profile.theme}
                onChange={(e) =>
                  saveProfileFields({
                    theme: e.target.value as Profile["theme"],
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
              >
                <option value="violet">Violet</option>
                <option value="cyan">Cyan</option>
                <option value="rose">Rose</option>
                <option value="emerald">Emerald</option>
              </select>
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
