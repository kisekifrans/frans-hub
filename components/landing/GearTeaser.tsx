"use client";

import {
  Headphones,
  Keyboard,
  Monitor,
  Mouse,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { useOptionalSession } from "@/components/providers/SessionProvider";

type ChipDef = {
  id: string;
  Icon: typeof Mouse;
  labelKey: "chip1" | "chip2" | "chip3" | "chip4";
  tint: string;
};

const CHIPS: ChipDef[] = [
  {
    id: "mouse",
    Icon: Mouse,
    labelKey: "chip1",
    tint: "from-violet-500/25 via-violet-400/10 to-transparent",
  },
  {
    id: "keyboard",
    Icon: Keyboard,
    labelKey: "chip2",
    tint: "from-fuchsia-500/25 via-fuchsia-400/10 to-transparent",
  },
  {
    id: "headphones",
    Icon: Headphones,
    labelKey: "chip3",
    tint: "from-cyan-500/25 via-cyan-400/10 to-transparent",
  },
  {
    id: "monitor",
    Icon: Monitor,
    labelKey: "chip4",
    tint: "from-rose-500/25 via-rose-400/10 to-transparent",
  },
];

/**
 * Compact "Setup & gear" teaser slotted between IdentityShowcase and the Aura
 * recap. Visible to everyone but only meaningful for setup enthusiasts. Anyone
 * intrigued can click through to the existing /gear showcase.
 *
 * Deliberately tiny: no extra reads, just icons + chips + a CTA. The animation
 * is opt-out via `useReducedMotion`.
 */
export function GearTeaser() {
  const t = useTranslations("landing.gear");
  const reduceMotion = useReducedMotion() ?? false;
  const session = useOptionalSession();
  const isAuthed = Boolean(session?.authenticated);
  // Logged-in users land directly on their Setup tab so they can start adding
  // their own gear. Guests get to see the site's curated example.
  const ctaHref = isAuthed ? "/dashboard?tab=gear" : "/gear";
  const ctaLabel = isAuthed ? t("ctaSignedIn") : t("cta");
  const helperLabel = isAuthed ? t("helperSignedIn") : t("helper");

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className="mt-16 sm:mt-24"
      aria-labelledby="gear-teaser-title"
    >
      <GlassCard
        padding="lg"
        className="relative overflow-hidden border-violet-200/40 bg-gradient-to-br from-white/65 via-violet-50/35 to-fuchsia-50/35 dark:from-zinc-900/50 dark:via-violet-950/30 dark:to-fuchsia-950/30"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-fuchsia-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="max-w-md">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
              <Sparkles className="h-3 w-3" aria-hidden />
              {t("eyebrow")}
            </p>
            <h2
              id="gear-teaser-title"
              className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-[1.6rem]"
            >
              {t("title")}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("subtitle")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {isAuthed ? (
                <NextLink
                  href={ctaHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-500"
                >
                  {ctaLabel}
                  <span aria-hidden>→</span>
                </NextLink>
              ) : (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-500"
                >
                  {ctaLabel}
                  <span aria-hidden>→</span>
                </Link>
              )}
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {helperLabel}
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-xs grid-cols-2 gap-2.5 sm:w-auto sm:max-w-none">
            {CHIPS.map(({ id, Icon, labelKey, tint }, idx) => (
              <motion.div
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.05 * idx }}
                className={`relative flex items-center gap-2.5 rounded-2xl border border-white/40 bg-gradient-to-br ${tint} px-3 py-2.5 text-[11px] font-medium text-zinc-700 backdrop-blur-sm dark:border-white/10 dark:text-zinc-200`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/60 text-violet-600 dark:bg-white/10 dark:text-violet-300">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="truncate">{t(labelKey)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.section>
  );
}
