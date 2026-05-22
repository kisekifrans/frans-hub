"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Music2, Share2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type FragmentSlot = "tl" | "tr" | "tc" | "ml" | "mr" | "bl" | "br" | "bc";

/** Fading month memories — text only, orbiting the card */
const MEMORY_FRAGMENTS: {
  key: string;
  slot: FragmentSlot;
  delay: number;
  faint?: boolean;
}[] = [
  { key: "ambientTime", slot: "tl", delay: 0 },
  { key: "ambientWeekend", slot: "tr", delay: 0.06, faint: true },
  { key: "ambientMidnight", slot: "tc", delay: 0.1, faint: true },
  { key: "ambientQris", slot: "ml", delay: 0.14 },
  { key: "ambientShopeeFood", slot: "mr", delay: 0.18, faint: true },
  { key: "ambientCoffee", slot: "bl", delay: 0.22 },
  { key: "ambientWallet", slot: "br", delay: 0.26 },
];

function MemoryGhost({
  label,
  slot,
  delay,
  faint,
  reduceMotion,
}: {
  label: string;
  slot: FragmentSlot;
  delay: number;
  faint?: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      animate={reduceMotion ? {} : { y: [0, -2, 0] }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: reduceMotion
          ? { duration: 0 }
          : {
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 0.6,
            },
      }}
      className={cn(
        "landing-recap-fragment",
        `landing-recap-fragment--${slot}`,
        faint && "landing-recap-fragment--faint",
      )}
    >
      {label}
    </motion.span>
  );
}

function SoundtrackVisualizer({ reduceMotion }: { reduceMotion: boolean }) {
  const bars = [0.35, 0.65, 0.45, 0.8, 0.5, 0.7, 0.4];
  return (
    <div
      className="flex h-6 shrink-0 items-end gap-[3px] px-0.5"
      aria-hidden
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn(
            "landing-recap-wave w-[3px] rounded-full bg-violet-500/50 dark:bg-violet-300/55",
            !reduceMotion && "landing-recap-wave--active",
          )}
          style={
            {
              "--wave-h": `${h}`,
              "--wave-delay": `${i * 0.12}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function RecapPreview() {
  const t = useTranslations("landing.recap");
  const reduceMotion = useReducedMotion();

  const secondaryStats = [
    {
      key: "spend",
      label: t("statSpend"),
      value: t("statSpendValue"),
    },
    {
      key: "wallet",
      label: t("statTop"),
      value: t("statTopValue"),
    },
  ];

  return (
    <div className="landing-recap-stage relative mx-auto min-h-[320px] w-full max-w-[min(100%,360px)] sm:min-h-[380px]">
      {MEMORY_FRAGMENTS.map((f) => (
        <MemoryGhost
          key={`${f.key}-${f.slot}`}
          label={t(f.key)}
          slot={f.slot}
          delay={f.delay}
          faint={f.faint}
          reduceMotion={reduceMotion}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full"
      >
        <div className="landing-recap-hero overflow-hidden rounded-2xl border">
          <div className="landing-recap-inner relative px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7">
            <div className="landing-recap-shine pointer-events-none absolute inset-0" aria-hidden />
            <div className="landing-recap-vignette pointer-events-none absolute inset-0" aria-hidden />

            <header className="relative">
              <div className="flex items-start justify-between gap-3">
                <span className="landing-recap-badge text-[10px] font-medium uppercase tracking-[0.22em]">
                  {t("badge")}
                </span>
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500/80 dark:text-amber-200/75" aria-hidden />
              </div>

              <div className="landing-recap-editorial mt-4">
                <span className="landing-recap-aura-label block text-[10px] font-medium uppercase tracking-[0.28em]">
                  {t("auraEditorial")}
                </span>
                <span className="landing-recap-aura-type mt-1 block text-sm font-medium italic tracking-wide">
                  {t("auraType")}
                </span>
              </div>

              <h3 className="landing-recap-headline mt-5 text-[1.75rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.15rem]">
                {t("headline")}
              </h3>

              <p className="landing-recap-mood mt-3 max-w-[28ch] text-[13px] leading-relaxed sm:text-sm">
                {t("mood")}
              </p>
            </header>

            <div className="relative mt-6 space-y-2">
              <div className="landing-recap-stat-hero rounded-2xl px-3 py-3.5 text-center sm:py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  {t("statSaved")}
                </p>
                <p className="landing-recap-hero-metric mt-1 tabular-nums tracking-tight">
                  {t("statSavedValue")}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold tracking-wide opacity-90">
                  {t("statSavedCaption")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {secondaryStats.map((s) => (
                  <div
                    key={s.key}
                    className="landing-recap-stat rounded-2xl px-2 py-2.5 text-center sm:py-3"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wider opacity-60">
                      {s.label}
                    </p>
                    <p className="mt-1 text-base font-semibold tabular-nums tracking-tight sm:text-lg">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-recap-soundtrack relative mt-5 flex items-center gap-3 rounded-2xl px-3 py-3">
              <span className="landing-recap-sound-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                <Music2 className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-55">
                  {t("soundtrackLabel")}
                </p>
                <p className="truncate text-xs font-medium sm:text-[13px]">
                  {t("soundtrack")}
                </p>
              </div>
              <SoundtrackVisualizer reduceMotion={reduceMotion} />
            </div>

            <button
              type="button"
              className="landing-recap-share relative mt-4 flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-semibold transition active:scale-[0.98]"
            >
              <span className="landing-recap-share-glow pointer-events-none absolute inset-0 rounded-full" aria-hidden />
              <Share2 className="relative h-4 w-4 shrink-0" aria-hidden />
              <span className="relative">{t("shareCta")}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
