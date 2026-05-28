import type { GearItem } from "@/lib/gear/types";
import type { Profile } from "@/lib/types";

export interface CompletionStep {
  id: "links" | "theme" | "publish";
  label: string;
  done: boolean;
  hint: string;
}

export interface ProfileQualitySnapshot {
  score: number;
  nextAction: string;
  completedCount: number;
  totalCount: number;
  steps: CompletionStep[];
}

function countReadyLinks(profile: Profile): number {
  return profile.blocks.filter((block) => {
    if (block.type !== "link" || !block.enabled) return false;
    return Boolean(block.url?.trim());
  }).length;
}

function countActiveSocials(profile: Profile): number {
  return profile.socialLinks.filter((link) => Boolean(link.url?.trim())).length;
}

export function buildProfileQualitySnapshot(params: {
  profile: Profile;
  gearEnabled: boolean;
  gearItems: GearItem[];
  hasSharedProfile: boolean;
}): ProfileQualitySnapshot {
  const { profile, gearEnabled, gearItems, hasSharedProfile } = params;

  const readyLinks = countReadyLinks(profile);
  const featuredGear = gearItems.filter((item) => item.featured && item.enabled);
  const hasBio = profile.bio.trim().length >= 24;
  const hasAvatar = Boolean(profile.avatarUrl?.trim());
  const hasDisplayName = Boolean(profile.displayName?.trim());
  const hasSocial = countActiveSocials(profile) > 0;

  const steps: CompletionStep[] = [
    {
      id: "links",
      label: "Add 2 links",
      done: readyLinks >= 2,
      hint: readyLinks >= 2 ? "Great start" : `${readyLinks}/2 ready`,
    },
    {
      id: "theme",
      label: "Pick your theme",
      done: Boolean(profile.theme),
      hint: profile.theme ? `Using ${profile.theme}` : "Choose your vibe",
    },
    {
      id: "publish",
      label: "Publish + share setup",
      done: gearEnabled && hasSharedProfile,
      hint: !gearEnabled
        ? "Turn setup public first"
        : hasSharedProfile
          ? "Shared at least once"
          : "Copy/share your public page",
    },
  ];

  let score = 0;
  if (readyLinks >= 2) score += 30;
  if (profile.theme) score += 15;
  if (gearEnabled && hasSharedProfile) score += 20;
  if (hasBio) score += 15;
  if (hasAvatar) score += 10;
  if (hasSocial) score += 5;
  if (hasDisplayName) score += 3;
  if (featuredGear.length > 0) score += 2;

  const completedCount = steps.filter((step) => step.done).length;
  const nextAction =
    steps.find((step) => !step.done)?.label ??
    (featuredGear.length > 0
      ? "Share your page and keep iterating"
      : "Feature one gear item to boost trust");

  return {
    score: Math.min(100, score),
    nextAction,
    completedCount,
    totalCount: steps.length,
    steps,
  };
}
