"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AuraTeaserCardProps = {
  className?: string;
  eyebrow?: string;
  label?: string;
  type?: string;
  metric?: string;
  detail?: string;
  cta?: string;
};

const DEFAULTS = {
  eyebrow: "Bonus layer",
  label: "Your Aura",
  type: "Soft Saving Era",
  metric: "+18% saved this month",
  detail: "GoPay became your top wallet.",
  cta: "Open your aura",
} as const;

export function AuraTeaserCard({
  className,
  eyebrow = DEFAULTS.eyebrow,
  label = DEFAULTS.label,
  type = DEFAULTS.type,
  metric = DEFAULTS.metric,
  detail = DEFAULTS.detail,
  cta = DEFAULTS.cta,
}: AuraTeaserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href="/finance"
        className={cn(
          "aura-teaser group relative block overflow-hidden rounded-2xl border border-violet-200/45 px-4 py-4 transition active:scale-[0.99] dark:border-violet-400/20 sm:px-5 sm:py-5 sm:hover:-translate-y-0.5",
          className,
        )}
        aria-label={cta}
      >
        <div className="aura-teaser__glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="aura-teaser__shine pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative flex items-start gap-3 sm:gap-4">
          <span className="aura-teaser__icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Sparkles className="h-4 w-4 text-white" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-600/90 dark:text-violet-300/85">
                {eyebrow}
              </span>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                · {label}
              </span>
            </div>
            <p className="mt-1 text-base font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-lg">
              {type}
            </p>
            <p className="mt-1 text-xs font-medium text-violet-700 dark:text-violet-200">
              {metric}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {detail}
            </p>
          </div>

          <span
            className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-violet-600 transition group-hover:bg-white dark:bg-white/10 dark:text-violet-200 dark:group-hover:bg-white/15"
            aria-hidden
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
