import type { FeedInsightTone } from "@/lib/finance/insights-feed";

export type LandingInsightKey =
  | "weekend"
  | "shopeeFood"
  | "peakHour"
  | "gopay"
  | "coffee"
  | "saved";

export type InsightDepth = "hero" | "mid" | "back";

export type LandingInsightDef = {
  key: LandingInsightKey;
  tone: FeedInsightTone;
  depth: InsightDepth;
  floatClass: string;
  delay: number;
  /** Vertical float amplitude in px (desktop). */
  floatY: number;
  /** Smaller float on narrow viewports. */
  floatYMobile?: number;
  /** Hidden below `sm` to avoid overlap on phones. */
  hideBelowSm?: boolean;
};

/** Layout + depth hierarchy — mobile positions first, enhanced at `sm+`. */
export const LANDING_HERO_INSIGHTS: LandingInsightDef[] = [
  {
    key: "weekend",
    tone: "attention",
    depth: "hero",
    floatClass:
      "left-0 top-0 z-30 max-w-[78%] sm:left-[2%] sm:top-8 sm:max-w-none",
    delay: 0,
    floatY: 7,
    floatYMobile: 3,
  },
  {
    key: "shopeeFood",
    tone: "attention",
    depth: "mid",
    floatClass:
      "right-0 top-[7.25rem] z-20 max-w-[76%] sm:right-[4%] sm:top-14 sm:max-w-none",
    delay: 0.12,
    floatY: 6,
    floatYMobile: 3,
  },
  {
    key: "gopay",
    tone: "positive",
    depth: "hero",
    floatClass:
      "bottom-2 left-0 z-30 max-w-[78%] sm:bottom-20 sm:left-auto sm:right-[8%] sm:max-w-none",
    delay: 0.28,
    floatY: 6,
    floatYMobile: 3,
  },
  {
    key: "peakHour",
    tone: "neutral",
    depth: "mid",
    hideBelowSm: true,
    floatClass: "left-[8%] bottom-28 z-20 sm:left-[10%] sm:bottom-32",
    delay: 0.35,
    floatY: 5,
  },
  {
    key: "coffee",
    tone: "neutral",
    depth: "back",
    hideBelowSm: true,
    floatClass:
      "left-1/2 top-[38%] z-10 hidden w-[200px] -translate-x-1/2 md:block",
    delay: 0.18,
    floatY: 4,
  },
  {
    key: "saved",
    tone: "positive",
    depth: "back",
    hideBelowSm: true,
    floatClass: "right-[18%] top-[48%] z-10 hidden w-[190px] sm:block",
    delay: 0.5,
    floatY: 4,
  },
];

export const LANDING_PAYMENT_KEYS = [
  "gopay",
  "ovo",
  "dana",
  "shopeePay",
] as const;

export type LandingPaymentKey = (typeof LANDING_PAYMENT_KEYS)[number];
