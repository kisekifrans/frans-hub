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
 *
 * Existing users also get their Google profile picture backfilled if their
 * stored avatar is empty (covers accounts created before Google-meta
 * extraction was added).
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<BootstrappedProfile> {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id, slug, avatar_url, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    // One-shot backfill of avatar / display name from Google metadata when the
    // stored values are missing. Doesn't overwrite anything the user has set.
    const patches: Record<string, string> = {};
    if (!existing.avatar_url) {
      const fromGoogle = avatarUrlFromUser(user);
      if (fromGoogle) patches.avatar_url = fromGoogle;
    }
    if (!existing.display_name || existing.display_name === "Frans Hub") {
      const fromGoogle = displayNameFromUser(user, existing.slug as string);
      if (fromGoogle && fromGoogle !== existing.display_name) {
        patches.display_name = fromGoogle;
      }
    }
    if (Object.keys(patches).length > 0) {
      await supabase
        .from("profiles")
        .update(patches)
        .eq("id", existing.id as string);
    }
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

  // NOTE: finance defaults are seeded lazily by `bootstrapFinanceState` the
  // first time the user opens /finance. We don't seed here because the seed
  // (~23 sequential inserts) would block the OAuth callback redirect by
  // several seconds and most users will set up links before finance anyway.

  return {
    id: profileId,
    slug: created.slug as string,
    created: true,
  };
}
