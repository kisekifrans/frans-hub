"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useOptionalSession } from "@/components/providers/SessionProvider";
import { AvatarFallback } from "@/components/ui/SafeImage";
import { isValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

/**
 * Landing-page top-right nav.
 *
 * Renders:
 *   - "Sign in" button when not authenticated (or session still loading).
 *   - Avatar + display name pill linking to /dashboard when authenticated.
 *
 * Always starts in the "Sign in" state to match server render and avoid
 * hydration warnings; flips to the authed state after SessionProvider resolves.
 */
export function LandingUserNav() {
  const t = useTranslations("landing");
  const session = useOptionalSession();

  const baseSignInClasses =
    "touch-manipulation rounded-full bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition active:scale-[0.98] hover:bg-violet-500 sm:px-3.5 sm:py-1.5";

  if (!session || session.loading || !session.authenticated) {
    return (
      <Link
        href="/login?next=/dashboard"
        className={baseSignInClasses}
        aria-label={t("nav.signIn")}
      >
        {t("nav.signIn")}
      </Link>
    );
  }

  // Authenticated branch
  const display = session.profile?.displayName || session.profile?.username || "";
  const avatarSrc = session.profile?.avatarUrl ?? null;

  return (
    <Link
      href="/dashboard"
      aria-label={display ? `Open ${display}'s dashboard` : "Open dashboard"}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/80 py-1 pl-1 pr-3 text-xs font-semibold text-zinc-800 shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white",
        "dark:border-white/12 dark:bg-white/10 dark:text-zinc-100 dark:hover:border-violet-400/60 dark:hover:bg-white/15",
      )}
    >
      <span className="relative inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-700 dark:text-violet-200">
        {isValidImageSrc(avatarSrc) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc!}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <AvatarFallback name={display || "U"} />
        )}
      </span>
      <span className="hidden max-w-[140px] truncate sm:inline">
        {display || "Dashboard"}
      </span>
      <span className="sm:hidden">·</span>
    </Link>
  );
}
