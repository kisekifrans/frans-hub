"use client";

import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { SocialLinksRow } from "@/components/profile/SocialLinksRow";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { GearPageProfile } from "@/lib/gear/types";
import type { Profile } from "@/lib/types";

interface GearHeroProps {
  profile: GearPageProfile;
  profileId?: string;
  setupDescription?: string;
}

export function GearHero({
  profile,
  profileId,
  setupDescription,
}: GearHeroProps) {
  const profileForAvatar: Profile = {
    ...profile,
    blocks: [],
    avatarStoragePath: undefined,
  };

  return (
    <header className="mb-10 text-center">
      <nav className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="glass-card inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
          aria-label="Kembali ke beranda"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          <Gamepad2 className="h-3.5 w-3.5 text-violet-500" />
          Setup & Gear
        </span>
        <ThemeToggle />
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        {profileId ? (
          <ProfileAvatar
            profile={profileForAvatar}
            profileId={profileId}
            editable={false}
          />
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {profile.displayName}
          </h1>
          {profile.verified ? <VerifiedBadge theme={profile.theme} /> : null}
        </div>

        <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">
          @{profile.username}
        </p>

        {profile.bio ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {profile.bio}
          </p>
        ) : null}

        {setupDescription ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-500">
            {setupDescription}
          </p>
        ) : null}

        {profile.socialLinks.length > 0 ? (
          <SocialLinksRow links={profile.socialLinks} className="mt-5" />
        ) : null}
      </motion.div>
    </header>
  );
}
