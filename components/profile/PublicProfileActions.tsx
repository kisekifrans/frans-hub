"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useProfileAuth,
  type ProfileAuthState,
} from "@/hooks/useProfileAuth";
import { cn } from "@/lib/utils";

type PublicProfileActionsProps = {
  /** Public slug of the page being viewed (e.g. frans). */
  viewedSlug?: string;
  /** When provided, skips a duplicate session fetch. */
  authState?: ProfileAuthState;
  className?: string;
};

const pillClass =
  "glass-card inline-flex min-h-[40px] touch-manipulation items-center rounded-full px-3 py-2 text-xs font-medium text-zinc-700 transition active:scale-[0.98] dark:text-zinc-200 sm:py-1.5 sm:hover:-translate-y-0.5 sm:hover:bg-white/55 dark:sm:hover:bg-white/15";

const pillPrimaryClass =
  "inline-flex min-h-[40px] touch-manipulation items-center rounded-full bg-violet-600 px-3 py-2 text-xs font-medium text-white shadow-sm shadow-violet-600/25 transition active:scale-[0.98] hover:bg-violet-500 dark:shadow-violet-900/30";

export function PublicProfileActions({
  viewedSlug,
  authState: authStateProp,
  className,
}: PublicProfileActionsProps) {
  const t = useTranslations("publicProfile");
  const { authState: authFromHook } = useProfileAuth(
    authStateProp === undefined ? viewedSlug : undefined,
  );
  const authState = authStateProp ?? authFromHook;

  if (authState === "loading") {
    return (
      <div
        className={cn("flex items-center gap-1.5", className)}
        aria-hidden
      >
        <span className="h-8 w-16 animate-pulse rounded-full bg-white/30 dark:bg-white/10" />
        <span className="h-8 w-20 animate-pulse rounded-full bg-white/20 dark:bg-white/5" />
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <nav
        className={cn("flex flex-wrap items-center justify-end gap-1.5", className)}
        aria-label={t("navLabel")}
      >
        <Link href="/login?next=/dashboard" className={pillClass}>
          {t("login")}
        </Link>
        <Link href="/login?next=/onboarding/username" className={pillPrimaryClass}>
          {t("createPage")}
        </Link>
      </nav>
    );
  }

  if (authState === "owner") {
    return (
      <nav
        className={cn("flex flex-wrap items-center justify-end gap-1.5", className)}
        aria-label={t("navLabel")}
      >
        <Link
          href="/finance"
          className="inline-flex min-h-[40px] touch-manipulation items-center gap-1.5 rounded-full border border-violet-200/60 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition active:scale-[0.98] dark:border-violet-400/25 dark:text-violet-200 sm:py-1.5 sm:hover:-translate-y-0.5"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {t("aura")}
        </Link>
        <Link href="/dashboard" className={pillPrimaryClass}>
          {t("editProfile")}
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-end gap-1.5", className)}
      aria-label={t("navLabel")}
    >
      <Link href="/dashboard" className={pillClass}>
        {t("dashboard")}
      </Link>
      <Link href="/login?next=/onboarding/username" className={pillPrimaryClass}>
        {t("createPage")}
      </Link>
    </nav>
  );
}
