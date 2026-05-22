import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isValidProfileSlug, normalizeProfileSlug } from "@/lib/auth/reserved-slugs";
import { DEFAULT_DATA } from "@/lib/defaults";
import { blockToDb } from "@/lib/supabase/mappers";

export type BootstrappedProfile = {
  id: string;
  slug: string;
  created: boolean;
};

function baseSlugFromUser(user: User): string {
  const meta = user.user_metadata as { username?: string; preferred_username?: string };
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

async function seedLinkBlocks(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  const seed = DEFAULT_DATA.profile;
  const blocks = seed.blocks.slice(0, 2).map((b, i) =>
    blockToDb({ ...b, order: i }, profileId),
  );
  if (!blocks.length) return;
  await supabase.from("blocks").insert(
    blocks.map((b) => ({
      ...b,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  );
}

/**
 * Ensures the signed-in user has exactly one owned profile.
 * Idempotent — safe to call after every login.
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
  const seed = DEFAULT_DATA.profile;

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      slug,
      user_id: user.id,
      username: seed.username,
      display_name: seed.displayName,
      bio: seed.bio,
      avatar_url: seed.avatarUrl,
      verified: false,
      social_links: [],
      theme: seed.theme,
    })
    .select("id, slug")
    .single();

  if (insertError) throw insertError;

  const profileId = created.id as string;
  await seedLinkBlocks(supabase, profileId).catch(() => {});

  const { seedFinanceDefaults } = await import("@/lib/supabase/finance-service");
  await seedFinanceDefaults(supabase, profileId).catch(() => {});

  return {
    id: profileId,
    slug: created.slug as string,
    created: true,
  };
}
