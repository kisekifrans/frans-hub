/**
 * Slug for the locale home hub (`/id`, `/en`) — your primary link page in DB.
 * When you change your public slug (e.g. main → frans), set this to match in .env.local.
 */
export function getSiteProfileSlug(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_PROFILE_SLUG?.trim().toLowerCase();
  return fromEnv || "main";
}
