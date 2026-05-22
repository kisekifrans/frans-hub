"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import { BlocksManager } from "@/components/admin/BlocksManager";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PublicLinkSlugField } from "@/components/dashboard/PublicLinkSlugField";
import { SocialLinksEditor } from "@/components/admin/SocialLinksEditor";
import { ThemePicker } from "@/components/profile/ThemePicker";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageShell } from "@/components/ui/PageShell";
import { useHub } from "@/hooks/useHub";
import type { AnalyticsGranularity, AnalyticsPeriod } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { DashboardTutorial } from "@/components/dashboard/DashboardTutorial";
import {
  dismissDashboardTutorial,
  isDashboardTutorialDismissed,
} from "@/lib/dashboard/tutorial";
import { cn } from "@/lib/utils";

/** Member link editor — same glass UI as admin, scoped to the signed-in user's profile. */
export function LinkHubEditor() {
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
  } = useHub("user");

  const [tab, setTab] = useState<"analytics" | "blocks" | "profile">("blocks");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    setShowTutorial(!isDashboardTutorialDismissed());
  }, []);

  const handleDismissTutorial = useCallback(() => {
    dismissDashboardTutorial();
    setShowTutorial(false);
  }, []);

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

  const publicPath =
    profile.slug && profile.slug !== "main" ? `/${profile.slug}` : null;

  return (
    <PageShell>
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/finance"
              className="glass-card flex h-10 w-10 items-center justify-center rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Your links
              </h1>
              <p className="text-sm text-zinc-500">
                {saving ? "Saving…" : publicPath ? `Live at ${publicPath}` : "Synced"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {publicPath && (
              <Link
                href={publicPath}
                target="_blank"
                className="rounded-full bg-violet-600/90 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-500"
              >
                View public page
              </Link>
            )}
            <Link
              href="/finance"
              className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
            >
              <Wallet className="h-3.5 w-3.5" />
              Finance
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {(
            [
              ["blocks", "Blocks"],
              ["profile", "Profile"],
              ["analytics", "Analytics"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                tab === key
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                  : "glass-card text-zinc-600 hover:bg-white/50 dark:text-zinc-300",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {showTutorial && (
          <DashboardTutorial
            className="mb-6"
            onDismiss={handleDismissTutorial}
            onOpenTab={setTab}
          />
        )}

        {tab === "analytics" && (
          <AnalyticsPanel
            stats={analytics}
            loading={analyticsLoading}
            onPeriodChange={handlePeriodChange}
          />
        )}

        {tab === "blocks" && (
          <BlocksManager
            blocks={profile.blocks}
            profileId={profileId}
            saving={saving}
            onAdd={addBlock}
            onPatch={patchBlock}
            onRemove={removeBlock}
            onReorder={reorder}
          />
        )}

        {tab === "profile" && (
          <GlassCard className="space-y-6">
            <PublicLinkSlugField
              initialSlug={
                !profile.slug || profile.slug === "main" ? "frans" : profile.slug
              }
              currentSlug={profile.slug ?? "main"}
              hint={
                profile.slug === "main"
                  ? "Your display username is separate from this link. This becomes your public URL, e.g. /yourname."
                  : undefined
              }
              onUpdated={(slug) => saveProfileFields({ slug })}
            />
            <ProfileFields profile={profile} onSave={saveProfileFields} />
            <SocialLinksEditor
              links={profile.socialLinks}
              onChange={(socialLinks) => saveProfileFields({ socialLinks })}
            />
            <ThemePicker
              value={profile.theme}
              onChange={(theme) => saveProfileFields({ theme })}
            />
          </GlassCard>
        )}
      </div>
    </PageShell>
  );
}

function ProfileFields({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (patch: Partial<Profile>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="text-zinc-500">Display name</span>
        <input
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/40 px-3 py-2 dark:bg-white/10"
          defaultValue={profile.displayName}
          onBlur={(e) => onSave({ displayName: e.target.value })}
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Username</span>
        <input
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/40 px-3 py-2 dark:bg-white/10"
          defaultValue={profile.username}
          onBlur={(e) => onSave({ username: e.target.value })}
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="text-zinc-500">Bio</span>
        <textarea
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/40 px-3 py-2 dark:bg-white/10"
          rows={3}
          defaultValue={profile.bio}
          onBlur={(e) => onSave({ bio: e.target.value })}
        />
      </label>
    </div>
  );
}
