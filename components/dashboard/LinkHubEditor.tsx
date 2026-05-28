"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { BlocksManager } from "@/components/admin/BlocksManager";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AuraTeaserCard } from "@/components/dashboard/AuraTeaserCard";
import { PublicLinkSlugField } from "@/components/dashboard/PublicLinkSlugField";
import { SocialLinksEditor } from "@/components/admin/SocialLinksEditor";
import { ActivationProgressCard } from "@/components/dashboard/ActivationProgressCard";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

const GearManager = dynamic(
  () =>
    import("@/components/admin/gear/GearManager").then((mod) => ({
      default: mod.GearManager,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
        Loading your setup…
      </div>
    ),
  },
);
import { ThemePicker } from "@/components/profile/ThemePicker";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageShell } from "@/components/ui/PageShell";
import { useHub } from "@/hooks/useHub";
import type { AnalyticsGranularity, AnalyticsPeriod } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardTutorial } from "@/components/dashboard/DashboardTutorial";
import { useGearAdmin } from "@/hooks/useGearAdmin";
import { buildProfileQualitySnapshot } from "@/lib/dashboard/completion";
import {
  dismissDashboardTutorial,
  isDashboardTutorialDismissed,
} from "@/lib/dashboard/tutorial";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const gear = useGearAdmin("user");

  type DashboardTab = "analytics" | "blocks" | "profile" | "gear";

  const [tab, setTab] = useState<DashboardTab>("blocks");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSharedProfile, setHasSharedProfile] = useState(false);

  // Read ?tab= once on mount via window.location instead of useSearchParams().
  // useSearchParams forces the page into Next.js's CSR-bailout path which,
  // combined with our `dynamic = "force-dynamic"` + Suspense streaming, ends
  // up breaking the dashboard's HTML response in production. Plain
  // window.location avoids that and keeps deep-linking (?tab=gear) working.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (
      requested === "blocks" ||
      requested === "profile" ||
      requested === "gear" ||
      requested === "analytics"
    ) {
      setTab(requested);
    }
  }, []);

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

  const publicPath =
    profile?.slug && profile.slug !== "main" ? `/${profile.slug}` : null;

  useEffect(() => {
    if (typeof window === "undefined" || !profileId) return;
    const key = `kawaragi:shared:${profileId}`;
    setHasSharedProfile(window.localStorage.getItem(key) === "1");
  }, [profileId]);

  const quality = useMemo(
    () => {
      if (!profile) {
        return {
          score: 0,
          nextAction: "Loading profile",
          completedCount: 0,
          totalCount: 3,
          steps: [
            { id: "links" as const, label: "Add 2 links", done: false, hint: "Loading..." },
            { id: "theme" as const, label: "Pick your theme", done: false, hint: "Loading..." },
            {
              id: "publish" as const,
              label: "Publish + share setup",
              done: false,
              hint: "Loading...",
            },
          ],
        };
      }
      return buildProfileQualitySnapshot({
        profile,
        gearEnabled: gear.gearEnabled,
        gearItems: gear.items,
        hasSharedProfile,
      });
    },
    [profile, gear.gearEnabled, gear.items, hasSharedProfile],
  );

  const handleOpenActivationStep = useCallback(
    (stepId: "links" | "theme" | "publish") => {
      if (stepId === "publish") {
        setTab("gear");
        return;
      }
      if (stepId === "theme") {
        setTab("profile");
        return;
      }
      setTab("blocks");
    },
    [],
  );

  const handleCopyPublicLink = useCallback(async () => {
    if (typeof window === "undefined" || !publicPath || !profileId) return;
    const url = `${window.location.origin}${publicPath}`;
    try {
      await navigator.clipboard.writeText(url);
      const key = `kawaragi:shared:${profileId}`;
      window.localStorage.setItem(key, "1");
      setHasSharedProfile(true);
      toast.success("Public link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }, [profileId, publicPath]);

  if (loading || !profile || !profileId || !analytics) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
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
              <>
                <Link
                  href={publicPath}
                  target="_blank"
                  className="rounded-full bg-violet-600/90 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-500"
                >
                  View public page
                </Link>
                <button
                  type="button"
                  onClick={() => void handleCopyPublicLink()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-white/70 px-3.5 py-2 text-xs font-semibold text-violet-700 transition hover:bg-white dark:border-violet-400/25 dark:bg-white/[0.03] dark:text-violet-200 dark:hover:bg-white/[0.08]"
                >
                  {hasSharedProfile ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {hasSharedProfile ? "Shared" : "Copy link"}
                </button>
              </>
            )}
            <Link
              href="/finance"
              className="group relative inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-violet-500/15 px-3.5 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:from-violet-500/25 hover:to-fuchsia-500/20 dark:border-violet-400/25 dark:text-violet-200"
              aria-label="Open your monthly aura recap"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Aura
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
              ["gear", "Setup"],
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

        <ActivationProgressCard
          score={quality.score}
          completedCount={quality.completedCount}
          totalCount={quality.totalCount}
          nextAction={quality.nextAction}
          steps={quality.steps}
          onOpenStep={handleOpenActivationStep}
        />

        {tab === "analytics" && (
          <AnalyticsPanel
            stats={analytics}
            loading={analyticsLoading}
            onPeriodChange={handlePeriodChange}
          />
        )}

        {tab === "blocks" && (
          <div className="space-y-5">
            <BlocksManager
              blocks={profile.blocks}
              profileId={profileId}
              saving={saving}
              onAdd={addBlock}
              onPatch={patchBlock}
              onRemove={removeBlock}
              onReorder={reorder}
            />
            <AuraTeaserCard />
          </div>
        )}

        {tab === "gear" && (
          <ErrorBoundary label="Setup">
            <GearManager
              mode="user"
              publicHref={profile.slug ? `/hub/${profile.slug}/gear` : "/gear"}
              publicLabel={profile.slug ? `/${profile.slug}/gear` : "/gear"}
            />
          </ErrorBoundary>
        )}

        {tab === "profile" && (
          <GlassCard className="space-y-6">
            <PublicLinkSlugField
              initialSlug={
                !profile.slug || profile.slug === "main"
                  ? profile.username || ""
                  : profile.slug
              }
              currentSlug={profile.slug ?? "main"}
              hint={
                profile.slug === "main"
                  ? "Your display username is separate from this link. This becomes your public URL, e.g. /yourname."
                  : undefined
              }
              onUpdated={(slug) => saveProfileFields({ slug })}
            />
            <ProfileFields
              profile={profile}
              profileId={profileId}
              onSave={saveProfileFields}
            />
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
  profileId,
  onSave,
}: {
  profile: Profile;
  profileId: string;
  onSave: (patch: Partial<Profile>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="mb-2 text-sm text-zinc-500">Avatar</p>
        <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/30 px-4 py-3 dark:bg-white/5">
          <ProfileAvatar
            profile={profile}
            profileId={profileId}
            editable
            onAvatarChange={(avatarUrl, avatarStoragePath) =>
              onSave({ avatarUrl, avatarStoragePath })
            }
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click the avatar to upload a new photo (max 8MB).
          </p>
        </div>
      </div>
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
