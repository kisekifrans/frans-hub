import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isValidProfileSlug, normalizeProfileSlug } from "@/lib/auth/reserved-slugs";

export type BootstrappedProfile = {
  id: string;
  slug: string;
  created: boolean;
};

type GoogleUserMeta = {
  username?: string;
  preferred_username?: string;
  name?: string;
  full_name?: string;
  given_name?: string;
  family_name?: string;
  avatar_url?: string;
  picture?: string;
};

function metaOf(user: User): GoogleUserMeta {
  return (user.user_metadata ?? {}) as GoogleUserMeta;
}

function baseSlugFromUser(user: User): string {
  const meta = metaOf(user);
  const fromMeta = meta.username ?? meta.preferred_username;
  if (fromMeta) {
    const n = normalizeProfileSlug(String(fromMeta));
    if (isValidProfileSlug(n)) return n;
  }
  const local = (user.email ?? "user").split("@")[0] ?? "user";
  const cleaned = local.toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = cleaned.slice(0, 24) || "user";
  return isValidProfileSlug(base) ? base : `user${cleaned.slice(0, 8) || "1"}`;
}

function displayNameFromUser(user: User, slug: string): string {
  const meta = metaOf(user);
  const candidate =
    meta.full_name?.trim() ||
    meta.name?.trim() ||
    [meta.given_name?.trim(), meta.family_name?.trim()]
      .filter(Boolean)
      .join(" ") ||
    "";
  if (candidate) return candidate.slice(0, 80);

  if (user.email) {
    const local = user.email.split("@")[0] ?? "";
    if (local) return local.slice(0, 80);
  }
  return slug;
}

function avatarUrlFromUser(user: User): string | null {
  const meta = metaOf(user);
  const raw = (meta.avatar_url ?? meta.picture ?? "").trim();
  if (!raw) return null;
  if (!raw.startsWith("https://") && !raw.startsWith("http://")) return null;
  return raw;
}

async function slugAvailable(
  supabase: SupabaseClient,
  slug: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return !data;
}

async function pickAvailableSlug(
  supabase: SupabaseClient,
  base: string,
): Promise<string> {
  let candidate = base;
  let n = 0;
  while (n < 50) {
    if (isValidProfileSlug(candidate) && (await slugAvailable(supabase, candidate))) {
      return candidate;
    }
    n += 1;
    candidate = `${base}${n}`;
  }
  return `user${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Ensures the signed-in user has exactly one owned profile.
 * Idempotent — safe to call after every login.
 *
 * New users get an empty link hub. We never seed example "Shop my favorites"
 * blocks because:
 *   1. Anonymous visitors of /<newuser> see spam-looking demo links.
 *   2. Empty state copy already prompts the user to add their first link.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<BootstrappedProfile> {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    return {
      id: existing.id as string,
      slug: existing.slug as string,
      created: false,
    };
  }

  const slug = await pickAvailableSlug(supabase, baseSlugFromUser(user));
  const displayName = displayNameFromUser(user, slug);
  const avatarUrl = avatarUrlFromUser(user);

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      slug,
      user_id: user.id,
      username: slug,
      display_name: displayName,
      bio: "",
      avatar_url: avatarUrl,
      verified: false,
      social_links: [],
      theme: "violet",
    })
    .select("id, slug")
    .single();

  if (insertError) throw insertError;

  const profileId = created.id as string;

  const { seedFinanceDefaults } = await import("@/lib/supabase/finance-service");
  await seedFinanceDefaults(supabase, profileId).catch(() => {});

  return {
    id: profileId,
    slug: created.slug as string,
    created: true,
  };
}
