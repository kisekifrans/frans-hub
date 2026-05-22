import { locales } from "@/i18n/routing";

/** Paths that must never be used as a public profile slug. */
export const RESERVED_SLUGS = new Set([
  ...locales,
  "admin",
  "api",
  "auth",
  "dashboard",
  "onboarding",
  "finance",
  "hub",
  "gear",
  "login",
  "main",
  "tools",
  "www",
  "_next",
  "favicon",
  "robots",
  "sitemap",
]);

import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  validateUsernameFormat,
} from "@/lib/auth/username";

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}

/** Valid public profile slug (route-safe). */
export function isValidProfileSlug(slug: string): boolean {
  const v = validateUsernameFormat(slug);
  return v.code === "ok";
}

export { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH };

export function normalizeProfileSlug(slug: string): string {
  return slug.trim().toLowerCase();
}
