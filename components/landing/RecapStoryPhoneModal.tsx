"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { RecapCard } from "@/components/landing/RecapCard";
import { cn } from "@/lib/utils";

type RecapStoryPhoneModalProps = {
  open: boolean;
  onClose: () => void;
};

function StoryAtmosphere({ animate }: { animate: boolean }) {
  return (
    <div className="story-atmosphere pointer-events-none absolute inset-0" aria-hidden>
      <div className="story-atmosphere__base absolute inset-0" />
      <div
        className={cn(
          "story-atmosphere__aurora story-atmosphere__aurora--a absolute inset-0",
          animate && "story-atmosphere__aurora--live",
        )}
      />
      <div
        className={cn(
          "story-atmosphere__aurora story-atmosphere__aurora--b absolute inset-0",
          animate && "story-atmosphere__aurora--live",
        )}
      />
      <div className="story-atmosphere__vignette absolute inset-0" />
    </div>
  );
}

function StoryMusicEnergy({ animate }: { animate: boolean }) {
  const bars = [0.25, 0.55, 0.4, 0.7, 0.35, 0.6, 0.45, 0.5, 0.3];
  return (
    <div
      className="story-music-energy pointer-events-none absolute inset-x-0 bottom-[28%] z-[2] flex justify-center"
      aria-hidden
    >
      <div className="story-music-energy__glow" />
      <div className="flex items-end gap-[5px] opacity-40">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn(
              "story-music-energy__bar w-[3px] rounded-full bg-violet-300/60",
              animate && "story-music-energy__bar--live",
            )}
            style={
              {
                "--bar-h": h,
                "--bar-delay": `${i * 0.14}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

function StoryRecapHero({
  children,
  animate,
}: {
  children: ReactNode;
  animate: boolean;
}) {
  return (
    <motion.div
      className="story-recap-hero relative z-10 w-[88%] max-w-[260px] -translate-y-1"
      initial={{ opacity: 0, y: 20, rotateZ: -2 }}
      animate={{
        opacity: 1,
        y: animate ? [0, -8, 0] : 0,
        rotateZ: animate ? [-1.5, 1, -1.5] : -1,
      }}
      transition={{
        opacity: { duration: 0.5 },
        y: animate
          ? { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5 },
        rotateZ: animate
          ? { duration: 9, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5 },
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="story-recap-hero__glow" aria-hidden />
      <div className="story-recap-hero__tilt">{children}</div>
    </motion.div>
  );
}

function StoryMomentChrome({
  children,
  animate,
}: {
  children: ReactNode;
  animate: boolean;
}) {
  const t = useTranslations("landing.recap");

  return (
    <div className="story-moment__viewport relative flex h-full min-h-0 flex-col overflow-hidden">
      <StoryAtmosphere animate={animate} />

      <div className="relative z-20 shrink-0 px-4 pt-3">
        <div className="flex gap-1">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="story-progress-fill h-full w-[72%] rounded-full bg-white/85" />
          </div>
          <div className="h-[2px] flex-[0.35] rounded-full bg-white/12" />
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="story-profile-dot h-6 w-6 shrink-0 rounded-full" />
          <p className="truncate text-[11px] font-medium text-white/90">
            {t("storyUsername")}
            <span className="font-normal text-white/40"> · {t("storyTime")}</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-2 pt-1">
        <StoryMusicEnergy animate={animate} />
        {children}
      </div>

      <div className="relative z-20 shrink-0 px-4 pb-4 pt-2">
        <div className="story-reply-hint h-8 rounded-full" />
        <p className="story-brand-tag mt-3 text-center">
          <span className="story-brand-tag__label">{t("storySharedFrom")}</span>
          <span className="story-brand-tag__url">{t("storyBrand")}</span>
        </p>
      </div>
    </div>
  );
}

export function RecapStoryPhoneModal({ open, onClose }: RecapStoryPhoneModalProps) {
  const t = useTranslations("landing.recap");
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="story-modal-backdrop absolute inset-0"
            aria-label={t("storyClose")}
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="story-moment relative w-full max-w-[min(100%,300px)]"
            role="dialog"
            aria-modal="true"
            aria-label={t("storyPreviewTitle")}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-1 right-0 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
              aria-label={t("storyClose")}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="story-moment__frame">
              <StoryMomentChrome animate={animate}>
                <StoryRecapHero animate={animate}>
                  <RecapCard variant="story" showShareButton={false} reduceMotion={!animate} />
                </StoryRecapHero>
              </StoryMomentChrome>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
