"use client";

import type { CSSProperties } from "react";
import { Music2, Share2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function SoundtrackVisualizer({
  reduceMotion,
  compact,
}: {
  reduceMotion: boolean;
  compact?: boolean;
}) {
  const bars = [0.35, 0.65, 0.45, 0.8, 0.5, 0.7, 0.4];
  return (
    <div
      className={cn(
        "flex shrink-0 items-end gap-[2px] px-0.5",
        compact ? "h-4" : "h-6",
      )}
      aria-hidden
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn(
            "landing-recap-wave rounded-full bg-violet-500/50 dark:bg-violet-300/55",
            compact ? "w-[2px]" : "w-[3px]",
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

type RecapCardProps = {
  variant?: "landing" | "story";
  reduceMotion?: boolean;
  showShareButton?: boolean;
  onShareClick?: () => void;
  className?: string;
};

export function RecapCard({
  variant = "landing",
  reduceMotion = false,
  showShareButton = true,
  onShareClick,
  className,
}: RecapCardProps) {
  const t = useTranslations("landing.recap");
  const compact = variant === "story";

  const secondaryStats = [
    { key: "spend", label: t("statSpend"), value: t("statSpendValue") },
    { key: "wallet", label: t("statTop"), value: t("statTopValue") },
  ];

  return (
    <div
      className={cn(
        "landing-recap-hero overflow-hidden rounded-2xl border",
        compact && "landing-recap-hero--story rounded-xl",
        className,
      )}
    >
      <div
        className={cn(
          "landing-recap-inner relative",
          compact ? "px-3 pb-3 pt-3.5" : "px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7",
        )}
      >
        <div className="landing-recap-shine pointer-events-none absolute inset-0" aria-hidden />
        <div className="landing-recap-vignette pointer-events-none absolute inset-0" aria-hidden />

        <header className="relative">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "landing-recap-badge font-medium uppercase tracking-[0.22em]",
                compact ? "text-[8px]" : "text-[10px]",
              )}
            >
              {t("badge")}
            </span>
            <Sparkles
              className={cn(
                "shrink-0 text-amber-500/80 dark:text-amber-200/75",
                compact ? "h-3 w-3" : "h-4 w-4",
              )}
              aria-hidden
            />
          </div>

          <div className="landing-recap-editorial mt-2 sm:mt-4">
            <span
              className={cn(
                "landing-recap-aura-label block font-medium uppercase tracking-[0.28em]",
                compact ? "text-[8px]" : "text-[10px]",
              )}
            >
              {t("auraEditorial")}
            </span>
            <span
              className={cn(
                "landing-recap-aura-type mt-0.5 block font-medium italic tracking-wide",
                compact ? "text-[11px]" : "text-sm",
              )}
            >
              {t("auraType")}
            </span>
          </div>

          <h3
            className={cn(
              "landing-recap-headline mt-3 font-semibold leading-[1.08] tracking-tight",
              compact
                ? "text-lg"
                : "mt-5 text-[1.75rem] sm:text-[2.15rem]",
            )}
          >
            {t("headline")}
          </h3>

          <p
            className={cn(
              "landing-recap-mood mt-2 max-w-[28ch] leading-relaxed",
              compact ? "text-[10px]" : "mt-3 text-[13px] sm:text-sm",
            )}
          >
            {t("mood")}
          </p>
        </header>

        <div className={cn("relative space-y-1.5", compact ? "mt-3" : "mt-6 space-y-2")}>
          <div
            className={cn(
              "landing-recap-stat-hero rounded-xl px-2 py-2 text-center",
              !compact && "rounded-2xl px-3 py-3.5 sm:py-4",
            )}
          >
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] opacity-70">
              {t("statSaved")}
            </p>
            <p
              className={cn(
                "landing-recap-hero-metric mt-0.5 tabular-nums tracking-tight",
                compact && "text-xl",
              )}
            >
              {t("statSavedValue")}
            </p>
            <p className="mt-1 text-[9px] font-semibold tracking-wide opacity-90 sm:text-[11px]">
              {t("statSavedCaption")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {secondaryStats.map((s) => (
              <div
                key={s.key}
                className={cn(
                  "landing-recap-stat rounded-xl px-2 py-2 text-center",
                  !compact && "rounded-2xl py-2.5 sm:py-3",
                )}
              >
                <p className="text-[8px] font-semibold uppercase tracking-wider opacity-60">
                  {s.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold tabular-nums tracking-tight",
                    compact ? "text-sm" : "text-base sm:text-lg",
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "landing-recap-soundtrack relative flex items-center gap-2 rounded-xl px-2.5 py-2",
            compact ? "mt-2.5" : "mt-5 gap-3 rounded-2xl px-3 py-3",
          )}
        >
          <span
            className={cn(
              "landing-recap-sound-icon flex shrink-0 items-center justify-center rounded-full",
              compact ? "h-7 w-7" : "h-9 w-9",
            )}
          >
            <Music2 className={compact ? "h-3 w-3" : "h-4 w-4"} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-55">
              {t("soundtrackLabel")}
            </p>
            <p className={cn("truncate font-medium", compact ? "text-[10px]" : "text-xs sm:text-[13px]")}>
              {t("soundtrack")}
            </p>
          </div>
          <SoundtrackVisualizer reduceMotion={reduceMotion} compact={compact} />
        </div>

        {showShareButton && (
          <button
            type="button"
            onClick={onShareClick}
            className={cn(
              "landing-recap-share relative flex w-full touch-manipulation items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98]",
              compact
                ? "mt-2.5 min-h-[36px] px-3 py-2 text-[11px]"
                : "mt-4 min-h-[48px] px-4 py-3.5 text-sm",
            )}
          >
            <span
              className="landing-recap-share-glow pointer-events-none absolute inset-0 rounded-full"
              aria-hidden
            />
            <Share2 className={cn("relative shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />
            <span className="relative">{t("shareCta")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
