"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ImageIcon,
  Link2,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { fadeInUp } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

type DashboardTab = "blocks" | "profile" | "analytics";

type DashboardTutorialProps = {
  onDismiss: () => void;
  onOpenTab: (tab: DashboardTab) => void;
  className?: string;
};

const pillars = [
  {
    tab: "blocks" as const,
    icon: Sparkles,
    title: "Blocks",
    line: "Your scroll — links, motion, embeds.",
    chips: [
      { icon: Link2, text: "Link" },
      { icon: ImageIcon, text: "GIF" },
      { icon: Sparkles, text: "TikTok · IG" },
    ],
    cta: "Blocks",
  },
  {
    tab: "profile" as const,
    icon: User,
    title: "Profile",
    line: "Make it feel like you.",
    chips: [
      { text: "Your /slug" },
      { text: "Bio & vibe" },
      { text: "Socials" },
    ],
    cta: "Profile",
  },
  {
    tab: "analytics" as const,
    icon: BarChart3,
    title: "Analytics",
    line: "See what people love.",
    chips: [
      { text: "What they open" },
      { text: "What they tap first" },
      { text: "Your hot links" },
    ],
    cta: "Analytics",
  },
];

export function DashboardTutorial({
  onDismiss,
  onOpenTab,
  className,
}: DashboardTutorialProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-50/80 via-white/60 to-fuchsia-50/40 px-4 py-5 dark:border-violet-500/20 dark:from-violet-950/35 dark:via-transparent dark:to-fuchsia-950/15 sm:px-5 sm:py-6",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-400 transition hover:bg-white/50 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
        aria-label="Skip"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-6 sm:pr-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-600/90 dark:text-violet-300/90">
          Your internet corner
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-[1.35rem]">
          One link becomes your whole vibe
        </h2>
        <p className="mt-1.5 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Your page is live. Three tabs — skip anytime.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {pillars.map(({ tab, icon: Icon, title, line, chips, cta }) => (
          <section
            key={tab}
            className="flex flex-col rounded-xl border border-white/40 bg-white/35 px-3.5 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-300" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">
                {title}
              </h3>
            </div>
            <p className="mt-2 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
              {line}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <span
                  key={chip.text}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-800 dark:bg-violet-400/10 dark:text-violet-200"
                >
                  {"icon" in chip && chip.icon && (
                    <chip.icon className="h-2.5 w-2.5 opacity-70" />
                  )}
                  {chip.text}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onOpenTab(tab)}
              className="mt-auto pt-3 text-left text-[10px] font-medium text-violet-600/90 hover:text-violet-500 dark:text-violet-400"
            >
              Open {cta} →
            </button>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            onOpenTab("blocks");
            onDismiss();
          }}
          className="rounded-full bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-500 active:scale-[0.98]"
        >
          Drop your first link
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full px-3 py-2.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
}
