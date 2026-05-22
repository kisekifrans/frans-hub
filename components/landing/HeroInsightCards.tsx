"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { FeedInsightTone } from "@/lib/finance/insights-feed";
import {
  LANDING_HERO_INSIGHTS,
  type InsightDepth,
  type LandingInsightDef,
} from "@/components/landing/landing-insights";
import { cn } from "@/lib/utils";

const toneStyles: Record<FeedInsightTone, string> = {
  positive: cn(
    "border-emerald-300/50 bg-gradient-to-br from-emerald-50/95 to-white/80",
    "dark:border-emerald-400/30 dark:from-emerald-500/22 dark:to-transparent",
  ),
  neutral: cn(
    "border-zinc-200/80 bg-gradient-to-br from-white/95 to-zinc-50/90",
    "dark:border-white/18 dark:from-white/14 dark:to-white/6",
  ),
  attention: cn(
    "border-amber-300/55 bg-gradient-to-br from-amber-50/95 to-white/80",
    "dark:border-amber-400/32 dark:from-amber-500/20 dark:to-transparent",
  ),
};

const tagStyles: Record<FeedInsightTone, string> = {
  positive:
    "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-100",
  neutral: "bg-zinc-100/90 text-zinc-600 dark:bg-white/12 dark:text-zinc-200",
  attention:
    "bg-amber-100/90 text-amber-900 dark:bg-amber-500/28 dark:text-amber-50",
};

const depthStyles: Record<InsightDepth, string> = {
  hero: "shadow-lg shadow-violet-900/8 dark:shadow-black/45 sm:shadow-xl sm:scale-[1.02]",
  mid: "shadow-md shadow-zinc-400/12 dark:shadow-black/35 sm:shadow-lg",
  back: "shadow-sm opacity-90 dark:opacity-80 sm:scale-[0.96]",
};

function InsightCard({
  item,
  reduceMotion,
}: {
  item: LandingInsightDef;
  reduceMotion: boolean;
}) {
  const t = useTranslations("landing.heroInsights");
  const { key: insightKey, tone, depth, delay, floatY, floatYMobile } = item;
  const emoji = t(`${insightKey}.emoji`);
  const message = t(`${insightKey}.message`);
  const tag = t(`${insightKey}.tag`);
  const amplitude = floatYMobile ?? Math.min(floatY, 4);

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute w-[min(84vw,232px)] sm:w-[min(88vw,248px)]",
        item.floatClass,
        item.hideBelowSm && "hidden sm:block",
      )}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{
        opacity: depth === "back" ? 0.88 : 1,
        y: reduceMotion ? 0 : [0, -amplitude, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: reduceMotion
          ? { duration: 0 }
          : {
              duration: 5 + delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 0.5,
            },
        scale: { duration: 0.5, delay },
      }}
    >
      <div
        className={cn(
          "landing-insight-card rounded-2xl border p-3 backdrop-blur-md sm:p-4",
          toneStyles[tone],
          depthStyles[depth],
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-lg leading-none sm:text-xl" aria-hidden>
            {emoji}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
              tagStyles[tone],
            )}
          >
            {tag}
          </span>
        </div>
        <p
          className={cn(
            "mt-2 font-medium leading-snug text-zinc-800 dark:text-zinc-50",
            depth === "hero" ? "text-sm sm:text-[15px]" : "text-[13px] sm:text-sm",
          )}
        >
          {message}
        </p>
      </div>
    </motion.div>
  );
}

export function HeroInsightCards() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative isolate mx-auto mt-8 h-[19rem] w-full max-w-lg overflow-hidden sm:mt-10 sm:h-[min(48vh,460px)] sm:max-w-2xl sm:overflow-visible lg:max-w-3xl"
      aria-hidden
    >
      {LANDING_HERO_INSIGHTS.map((item) => (
        <InsightCard key={item.key} item={item} reduceMotion={reduceMotion} />
      ))}
      <div
        className="pointer-events-none absolute inset-x-10 bottom-0 top-1/2 rounded-[2rem] bg-gradient-to-t from-violet-400/10 via-transparent to-transparent blur-2xl dark:from-violet-600/15 sm:inset-x-8 sm:blur-3xl"
        aria-hidden
      />
    </div>
  );
}
