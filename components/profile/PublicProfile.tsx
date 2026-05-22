"use client";

import { Loader2, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { BlockRenderer } from "@/components/profile/BlockRenderer";
import { ProfileOwnerPanel } from "@/components/profile/ProfileOwnerPanel";
import { PublicProfileActions } from "@/components/profile/PublicProfileActions";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileShareBar } from "@/components/profile/ProfileShareBar";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageShell } from "@/components/ui/PageShell";
import { stagger, blockItemVariants } from "@/components/ui/motion";
import { useProfileAuth } from "@/hooks/useProfileAuth";
import { usePublicHub } from "@/hooks/usePublicHub";
import { sortBlocks } from "@/lib/store";

type PublicProfileProps = {
  /** When set, loads /{slug} public hub (not locale home). */
  slug?: string;
  /** Hide site-wide nav (gear, admin) on member public pages. */
  minimalNav?: boolean;
};

export function PublicProfile({ slug, minimalNav = Boolean(slug) }: PublicProfileProps) {
  const t = useTranslations("common");
  const tOwner = useTranslations("publicProfile");
  const { profile, profileId, loading, notFound, trackClick } = usePublicHub(slug);
  const publicSlug = profile?.slug ?? slug;
  const { authState, isOwner } = useProfileAuth(publicSlug);

  if (loading) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  if (notFound) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card max-w-md space-y-3 rounded-2xl p-6 text-center">
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            {t("profileNotFound")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("profileNotFoundHint")}
          </p>
          <Link
            href="/login?next=/dashboard"
            className="inline-block text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            {t("profileNotFoundCta")}
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!profile || !profileId) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-zinc-600 dark:text-zinc-300">
          {t("hubUnavailable")}{" "}
          <code className="rounded bg-white/20 px-1">supabase/schema.sql</code>.
        </p>
      </PageShell>
    );
  }

  const blocks = sortBlocks(profile.blocks).filter((b) => b.enabled);
  const linkCount = blocks.filter((b) => b.type === "link").length;
  const featuredLinkId = blocks.find((b) => b.type === "link")?.id;

  return (
    <PageShell variant={profile.theme}>
      <div className="profile-shell mx-auto flex min-h-screen max-w-lg flex-col px-4 py-5 sm:px-6 sm:py-8">
        <nav className="mb-4 flex flex-col gap-2.5 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <LocaleLink
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            {t("brand")}
            <span className="text-violet-600 dark:text-violet-400">.io</span>
          </LocaleLink>
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            {!minimalNav && (
              <LocaleLink
                href="/gear"
                className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 dark:hover:bg-white/15 sm:h-10 sm:w-10"
                aria-label={t("gearShowcase")}
              >
                <Gamepad2 className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              </LocaleLink>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            {(slug || !minimalNav) && (
              <PublicProfileActions
                viewedSlug={publicSlug}
                authState={authState}
              />
            )}
          </div>
        </nav>

        {isOwner && (
          <ProfileOwnerPanel
            linkCount={linkCount}
            hasBio={Boolean(profile.bio?.trim())}
          />
        )}

        <ProfileHeader profile={profile} profileId={profileId} />

        {!isOwner && (
          <ProfileShareBar username={profile.username} slug={profile.slug ?? slug} />
        )}

        <motion.ul
          className="mt-4 flex flex-col gap-3 pb-10 sm:mt-5 sm:gap-3.5 sm:pb-12"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {blocks.length === 0 && isOwner ? (
            <motion.li variants={blockItemVariants}>
              <div className="glass-card rounded-2xl border border-dashed border-violet-200/50 px-4 py-8 text-center dark:border-violet-500/25">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {tOwner("owner.emptyBlocksTitle")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {tOwner("owner.emptyBlocksHint")}
                </p>
                <Link
                  href="/dashboard"
                  className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-violet-600/20 transition hover:bg-violet-500"
                >
                  {tOwner("owner.emptyBlocksCta")}
                </Link>
              </div>
            </motion.li>
          ) : (
            blocks.map((block) => (
              <motion.li key={block.id} variants={blockItemVariants}>
                <BlockRenderer
                  block={block}
                  featured={block.type === "link" && block.id === featuredLinkId}
                  onLinkClick={block.type === "link" ? trackClick : undefined}
                />
              </motion.li>
            ))
          )}
        </motion.ul>

        <footer className="mt-auto pb-3 text-center text-xs text-zinc-500 dark:text-zinc-400 sm:pb-4">
          {t("poweredBy")}
        </footer>
      </div>
    </PageShell>
  );
}
