"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ImageIcon, Link2, Palette, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type FloatingChip = {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  slot: string;
  delay: number;
  hideBelowSm?: boolean;
};

const FLOATING_CHIPS: FloatingChip[] = [
  {
    key: "chipLink",
    icon: Link2,
    slot: "-top-3 left-6 sm:-top-4 sm:-left-4",
    delay: 0,
  },
  {
    key: "chipEmbed",
    icon: Sparkles,
    slot: "sm:top-16 sm:-right-8",
    delay: 0.12,
    hideBelowSm: true,
  },
  {
    key: "chipGif",
    icon: ImageIcon,
    slot: "sm:bottom-28 sm:-left-10",
    delay: 0.22,
    hideBelowSm: true,
  },
  {
    key: "chipTheme",
    icon: Palette,
    slot: "-bottom-3 right-6 sm:-bottom-4 sm:-right-4",
    delay: 0.3,
  },
];

function FloatingChip({
  chip,
  reduceMotion,
}: {
  chip: FloatingChip;
  reduceMotion: boolean;
}) {
  const t = useTranslations("landing.identity");
  const Icon = chip.icon;
  return (
    <motion.span
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      animate={
        reduceMotion
          ? {}
          : {
              y: [0, -4, 0],
            }
      }
      transition={{
        opacity: { duration: 0.5, delay: chip.delay },
        y: reduceMotion
          ? { duration: 0 }
          : {
              duration: 5.5 + chip.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: chip.delay + 0.4,
            },
      }}
      className={cn(
        "identity-chip absolute z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium",
        chip.slot,
        chip.hideBelowSm && "hidden sm:inline-flex",
      )}
    >
      <Icon className="h-3 w-3 opacity-80" aria-hidden />
      {t(chip.key)}
    </motion.span>
  );
}

function MockLink({
  title,
  hint,
  hue,
}: {
  title: string;
  hint: string;
  hue: "violet" | "rose" | "amber";
}) {
  const hueClass = {
    violet:
      "from-violet-500/30 to-fuchsia-500/15 dark:from-violet-400/25 dark:to-fuchsia-400/10",
    rose: "from-rose-500/25 to-pink-500/15 dark:from-rose-400/20 dark:to-pink-400/10",
    amber:
      "from-amber-500/25 to-orange-500/15 dark:from-amber-400/20 dark:to-orange-400/10",
  }[hue];

  return (
    <div className="identity-mock-link flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.05]">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white/90 shadow-sm",
          hueClass,
        )}
        aria-hidden
      >
        <Link2 className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-zinc-900 dark:text-white">
          {title}
        </p>
        <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
    </div>
  );
}

export function IdentityShowcase() {
  const t = useTranslations("landing.identity");
  const reduceMotion = useReducedMotion();

  return (
    <section className="landing-identity-section relative mt-16 sm:mt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
          {t("eyebrow")}
        </p>
        <h2 className="mx-auto mt-3 max-w-xl text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-[1.75rem]">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
          {t("subtitle")}
        </p>
      </motion.div>

      <div className="relative mx-auto mt-10 w-full max-w-[min(100%,340px)] sm:mt-14 sm:max-w-[380px]">
        {FLOATING_CHIPS.map((chip) => (
          <FloatingChip key={chip.key} chip={chip} reduceMotion={!!reduceMotion} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="identity-page relative z-10 overflow-hidden rounded-[2rem] border border-white/40 px-5 pb-5 pt-7 dark:border-white/8 sm:px-6 sm:pb-6"
        >
          <div className="identity-page__glow pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative flex flex-col items-center text-center">
            <div className="identity-avatar relative flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white">
              <span aria-hidden>K</span>
            </div>
            <p className="mt-3 text-[11px] font-medium tracking-wide text-violet-600 dark:text-violet-300">
              {t("pageSlug")}
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">
              {t("pageDisplay")}
            </p>
            <p className="mt-2 max-w-[24ch] text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("pageBio")}
            </p>
          </div>

          <div className="relative mt-5 space-y-2.5">
            <MockLink title={t("pageLink1")} hint="github.com" hue="violet" />
            <MockLink title={t("pageLink2")} hint="shopee.co.id" hue="rose" />
            <MockLink title={t("pageLink3")} hint="notion.so" hue="amber" />
          </div>

          <div className="relative mt-4 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-zinc-300/60 dark:to-white/15" />
            kawaragi.io
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-zinc-300/60 dark:to-white/15" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
