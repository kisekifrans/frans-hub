import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidProfileSlug, normalizeProfileSlug } from "@/lib/auth/reserved-slugs";
import { assertValidUsername } from "@/lib/auth/username";

export type UserProfileRow = {
  id: string;
  slug: string;
  user_id: string | null;
  username: string;
  display_name: string;
  avatar_url: string | null;
  slug_changed_at?: string | null;
};

const PROFILE_COLUMNS =
  "id, slug, user_id, username, display_name, avatar_url, slug_changed_at";

/** Profile owned by the signed-in user (default workspace). */
export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfileRow | null;
}

/** Public profile by URL slug (e.g. /frans). */
export async function getProfileBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<UserProfileRow | null> {
  const normalized = normalizeProfileSlug(slug);
  if (!isValidProfileSlug(normalized)) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("slug", normalized)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfileRow | null;
}

export function assertValidNewSlug(slug: string): string {
  return assertValidUsername(slug);
}
