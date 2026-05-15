"use client";

import Link from "next/link";
import { Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BlockRenderer } from "@/components/profile/BlockRenderer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileShareBar } from "@/components/profile/ProfileShareBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageShell } from "@/components/ui/PageShell";
import { stagger, blockItemVariants } from "@/components/ui/motion";
import { usePublicHub } from "@/hooks/usePublicHub";
import { sortBlocks } from "@/lib/store";

export function PublicProfile() {
  const { profile, loading, trackClick } = usePublicHub();

  if (loading) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-zinc-600 dark:text-zinc-300">
          Hub unavailable. Configure Supabase and run{" "}
          <code className="rounded bg-white/20 px-1">supabase/schema.sql</code>.
        </p>
      </PageShell>
    );
  }

  const blocks = sortBlocks(profile.blocks).filter((b) => b.enabled);

  return (
    <PageShell variant={profile.theme}>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:px-6">
        <nav className="mb-6 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Affiliate Hub
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin"
              className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
              aria-label="Admin panel"
            >
              <Settings className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </Link>
          </div>
        </nav>

        <ProfileHeader profile={profile} />
        <ProfileShareBar username={profile.username} />

        <motion.ul
          className="mt-6 flex flex-col gap-4 pb-12"
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

        <footer className="mt-auto pb-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Powered by Affiliate Hub
        </footer>
      </div>
    </PageShell>
  );
}
