import { locales, type AppLocale } from "@/i18n/routing";
import { isValidProfileSlug } from "@/lib/auth/reserved-slugs";

const LOCALE_PATTERN = locales.join("|");
const LOCALIZED_RESERVED_SEGMENTS = new Set([
  "admin",
  "privacy",
  "terms",
  "gear",
  "signature",
  "typing",
  "typingmonster",
  "tools",
]);

/** /id/admin, /en/admin/audit, etc. */
export function isLocalizedAdminPath(pathname: string): boolean {
  return new RegExp(`^/(${LOCALE_PATTERN})/admin(/.*)?$`).test(pathname);
}

export function localeFromLocalizedAdminPath(pathname: string): AppLocale | null {
  const match = pathname.match(new RegExp(`^/(${LOCALE_PATTERN})/admin`));
  return match ? (match[1] as AppLocale) : null;
}

export function isBareAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Site-owner routes (gear, edge cases, main hub admin). */
export function isSiteAdminPath(pathname: string): boolean {
  return isBareAdminPath(pathname) || isLocalizedAdminPath(pathname);
}

export function isFinancePath(pathname: string): boolean {
  return pathname === "/finance" || pathname.startsWith("/finance/");
}

export function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

/** Auth lives at /login (not under [locale]). */
export function isLocalizedLoginPath(pathname: string): boolean {
  return new RegExp(`^/(${LOCALE_PATTERN})/login$`).test(pathname);
}

export function isLoginPath(pathname: string): boolean {
  return pathname === "/login" || isLocalizedLoginPath(pathname);
}

/** Any authenticated member (finance, link editor, onboarding). */
export function isMemberPath(pathname: string): boolean {
  return (
    isFinancePath(pathname) ||
    isDashboardPath(pathname) ||
    isOnboardingPath(pathname)
  );
}

/** @deprecated Use isSiteAdminPath — kept for gradual migration */
export function isAdminPath(pathname: string): boolean {
  return isSiteAdminPath(pathname) || isMemberPath(pathname);
}

/** Single-segment public profile URL e.g. /frans */
export function isPublicSlugPath(pathname: string): boolean {
  const match = pathname.match(/^\/([^/]+)$/);
  if (!match) return false;
  return isValidProfileSlug(match[1]);
}

export function slugFromPublicPath(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)$/);
  if (!match || !isValidProfileSlug(match[1])) return null;
  return match[1];
}

/** Localized single-segment profile URL e.g. /en/frans, /id/kiseki */
export function slugFromLocalizedPublicPath(pathname: string): string | null {
  const match = pathname.match(new RegExp(`^/(${LOCALE_PATTERN})/([^/]+)$`));
  if (!match) return null;
  const slug = match[2];
  if (!slug || LOCALIZED_RESERVED_SEGMENTS.has(slug)) return null;
  return isValidProfileSlug(slug) ? slug : null;
}
