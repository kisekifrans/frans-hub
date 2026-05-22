"use client";

import { motion } from "framer-motion";
import {
  Link2,
  Pencil,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { fadeInUp } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

type ProfileOwnerPanelProps = {
  linkCount: number;
  hasBio: boolean;
  className?: string;
};

const actionClass =
  "glass-card group flex min-h-[72px] flex-col justify-between rounded-2xl p-3.5 text-left transition active:scale-[0.98] sm:hover:-translate-y-0.5 sm:hover:bg-white/55 dark:sm:hover:bg-white/12";

export function ProfileOwnerPanel({
  linkCount,
  hasBio,
  className,
}: ProfileOwnerPanelProps) {
  const t = useTranslations("publicProfile.owner");
  const isSparse = linkCount === 0;
  const needsSetup = linkCount < 2 || !hasBio;

  const actions = [
    {
      key: "addLink",
      href: "/dashboard",
      icon: Plus,
      label: t("actionAddLink"),
      hint: t("actionAddLinkHint"),
      accent: "text-violet-600 dark:text-violet-300",
    },
    {
      key: "finance",
      href: "/finance",
      icon: Wallet,
      label: t("actionFinance"),
      hint: t("actionFinanceHint"),
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "edit",
      href: "/dashboard",
      icon: Pencil,
      label: t("actionEdit"),
      hint: t("actionEditHint"),
      accent: "text-fuchsia-600 dark:text-fuchsia-300",
    },
    {
      key: "customize",
      href: "/dashboard",
      icon: Sparkles,
      label: t("actionCustomize"),
      hint: t("actionCustomizeHint"),
      accent: "text-amber-600 dark:text-amber-300",
    },
  ] as const;

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className={cn("mb-4 sm:mb-5", className)}
      aria-label={t("sectionLabel")}
    >
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/40 px-4 py-4 dark:border-violet-500/20 sm:px-5 sm:py-5">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/80 via-fuchsia-50/40 to-transparent dark:from-violet-950/50 dark:via-fuchsia-950/20 dark:to-transparent"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
            {t("welcomeTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
            {t("welcomeSubtitle")}
          </p>
        </div>
      </div>

      {isSparse && (
        <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {t("emptyLinks")}
        </p>
      )}

      {needsSetup && !isSparse && (
        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {!hasBio ? t("emptyBio") : t("setupHint")}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
        {actions.map(({ key, href, icon: Icon, label, hint, accent }) => (
          <Link key={key} href={href} className={actionClass}>
            <Icon className={cn("h-4 w-4", accent)} aria-hidden />
            <span>
              <span className="block text-xs font-semibold text-zinc-900 dark:text-white">
                {label}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
                {hint}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-violet-600 transition hover:text-violet-500 dark:text-violet-400"
      >
        <Link2 className="h-3 w-3" aria-hidden />
        {t("viewPublicHint")}
      </Link>
    </motion.section>
  );
}
