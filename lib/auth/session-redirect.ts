import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileForUser } from "@/lib/auth/profile";
import { needsSlugOnboarding } from "@/lib/auth/slug-onboarding";
import { isSiteAdmin } from "@/lib/auth/site-admin";

export async function resolvePostLoginPath(
  supabase: SupabaseClient,
  userId: string,
  email: string | null | undefined,
  requestedNext: string | null,
): Promise<string> {
  const admin = await isSiteAdmin(supabase, userId, email);
  const profile = await getProfileForUser(supabase, userId);

  if (
    profile &&
    needsSlugOnboarding(profile.slug, profile.slug_changed_at) &&
    !admin
  ) {
    return "/onboarding/username";
  }

  const next = requestedNext?.trim();
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    if (next.includes("/admin") && admin) return next;
    if (
      next.startsWith("/finance") ||
      next.startsWith("/dashboard") ||
      next.startsWith("/onboarding")
    ) {
      return next;
    }
  }

  if (admin) return "/id/admin";
  return "/dashboard";
}
