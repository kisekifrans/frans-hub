"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { RecapCard } from "@/components/landing/RecapCard";
import { RecapStoryPhoneModal } from "@/components/landing/RecapStoryPhoneModal";
import { cn } from "@/lib/utils";

type FragmentSlot = "tl" | "tr" | "tc" | "ml" | "mr" | "bl" | "br" | "bc";

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

export function RecapPreview() {
  const t = useTranslations("landing.recap");
  const reduceMotion = useReducedMotion();
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <>
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
          <RecapCard
            reduceMotion={reduceMotion ?? false}
            onShareClick={() => setStoryOpen(true)}
          />
        </motion.div>
      </div>

      <RecapStoryPhoneModal open={storyOpen} onClose={() => setStoryOpen(false)} />
    </>
  );
}
