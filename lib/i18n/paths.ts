import { locales, type AppLocale } from "@/i18n/routing";

const LOCALE_PATTERN = locales.join("|");

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

export function isFinancePath(pathname: string): boolean {
  return pathname === "/finance" || pathname.startsWith("/finance/");
}

export function isAdminPath(pathname: string): boolean {
  return (
    isBareAdminPath(pathname) ||
    isLocalizedAdminPath(pathname) ||
    isFinancePath(pathname)
  );
}
