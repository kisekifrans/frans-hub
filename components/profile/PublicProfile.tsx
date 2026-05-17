"use client";

import { Settings, Loader2, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BlockRenderer } from "@/components/profile/BlockRenderer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileShareBar } from "@/components/profile/ProfileShareBar";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageShell } from "@/components/ui/PageShell";
import { stagger, blockItemVariants } from "@/components/ui/motion";
import { usePublicHub } from "@/hooks/usePublicHub";
import { sortBlocks } from "@/lib/store";

export function PublicProfile() {
  const t = useTranslations("common");
  const { profile, profileId, loading, trackClick } = usePublicHub();

  if (loading) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
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

  return (
    <PageShell variant={profile.theme}>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6 sm:px-6 sm:py-8">
        <nav className="mb-4 flex items-center justify-between sm:mb-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t("brand")}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/gear"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 dark:hover:bg-white/15 sm:h-10 sm:w-10"
              aria-label={t("gearShowcase")}
            >
              <Gamepad2 className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/admin"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 dark:hover:bg-white/15 sm:h-10 sm:w-10"
              aria-label={t("adminPanel")}
            >
              <Settings className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </Link>
          </div>
        </nav>

        <ProfileHeader profile={profile} profileId={profileId} />

        <ProfileShareBar username={profile.username} />

        <motion.ul
          className="mt-4 flex flex-col gap-3 pb-10 sm:mt-5 sm:gap-3.5 sm:pb-12"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {blocks.map((block) => (
            <motion.li key={block.id} variants={blockItemVariants}>
              <BlockRenderer
                block={block}
                onLinkClick={block.type === "link" ? trackClick : undefined}
              />
            </motion.li>
          ))}
        </motion.ul>

        <footer className="mt-auto pb-3 text-center text-xs text-zinc-500 dark:text-zinc-400 sm:pb-4">
          {t("poweredBy")}
        </footer>
      </div>
    </PageShell>
  );
}
