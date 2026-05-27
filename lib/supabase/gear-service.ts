import type { SupabaseClient } from "@supabase/supabase-js";
import { slugifyCategory } from "@/lib/gear/format";
import type {
  GearCategory,
  GearItem,
  GearPageData,
  GearPageSettings,
} from "@/lib/gear/types";
import { DEFAULT_GEAR_CATEGORY_NAMES } from "@/lib/gear/types";
import type {
  DbGearCategory,
  DbGearItem,
  DbGearPageSettings,
  DbProfile,
} from "./database.types";
import {
  gearCategoryFromDb,
  gearCategoryToDb,
  gearItemFromDb,
  gearItemToDb,
  gearProfileFromDb,
  gearSettingsFromDb,
} from "./gear-mappers";

const PROFILE_SLUG = "main";

type ProfileResolution = {
  id: string;
  gear_enabled?: boolean | null;
};

async function resolveProfileId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", PROFILE_SLUG)
    .single();
  if (error || !data) throw new Error("Profile not found");
  return data.id as string;
}

/**
 * PG error code 42703 = undefined_column. Surfaces when the gear_enabled
 * column hasn't been created yet (migration 021 not applied). We treat the
 * missing column the same as gear_enabled = false so the dashboard still
 * loads and we can show a "run the migration" hint instead of crashing.
 */
function isMissingGearEnabledColumn(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  if (e.code === "42703") return true;
  return Boolean(e.message?.includes("gear_enabled"));
}

async function resolveProfileBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ProfileResolution | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, gear_enabled")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    if (isMissingGearEnabledColumn(error)) {
      // Pre-migration fallback: pretend gear is disabled until 021 runs.
      const { data: idOnly, error: idErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (idErr) throw idErr;
      return idOnly
        ? ({ id: (idOnly as { id: string }).id, gear_enabled: false })
        : null;
    }
    throw error;
  }
  return (data as ProfileResolution | null) ?? null;
}

async function resolveOwnedProfile(
  supabase: SupabaseClient,
): Promise<ProfileResolution> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, gear_enabled")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    if (isMissingGearEnabledColumn(error)) {
      const { data: idOnly, error: idErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (idErr) throw idErr;
      if (!idOnly) throw new Error("No profile for this account.");
      return { id: (idOnly as { id: string }).id, gear_enabled: false };
    }
    throw error;
  }
  if (!data) throw new Error("No profile for this account.");
  return data as ProfileResolution;
}

async function seedGearCategories(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  const rows = DEFAULT_GEAR_CATEGORY_NAMES.map((name, i) => ({
    profile_id: profileId,
    slug: slugifyCategory(name),
    name,
    sort_order: i,
    created_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("gear_categories").insert(rows);
  if (error) throw error;

  await supabase.from("gear_page_settings").upsert({
    profile_id: profileId,
    setup_description: "",
    updated_at: new Date().toISOString(),
  });
}

/**
 * Core loader: given a resolved profile id, parallel-fetch the gear shape.
 * Used by every public/owner/site fetcher below.
 */
async function loadGearForProfile(
  supabase: SupabaseClient,
  profileId: string,
  options: { includeDisabled?: boolean; seedIfEmpty?: boolean } = {},
): Promise<GearPageData & { profileId: string }> {
  // Parallel: profile + settings + categories + items. Previously 4 sequential
  // round-trips for /gear; now ~1 round-trip's worth.
  const [profileRes, settingsRes, catRes, itemRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).single(),
    supabase
      .from("gear_page_settings")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle(),
    supabase
      .from("gear_categories")
      .select("*")
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: true }),
    options.includeDisabled
      ? supabase
          .from("gear_items")
          .select("*")
          .eq("profile_id", profileId)
          .order("sort_order", { ascending: true })
      : supabase
          .from("gear_items")
          .select("*")
          .eq("profile_id", profileId)
          .eq("enabled", true)
          .order("sort_order", { ascending: true }),
  ]);

  if (profileRes.error || !profileRes.data) {
    throw profileRes.error ?? new Error("No profile");
  }
  if (catRes.error) throw catRes.error;
  if (itemRes.error) throw itemRes.error;

  let catRows = catRes.data ?? [];
  if (options.seedIfEmpty && catRows.length === 0) {
    // Seed best-effort. Pre-migration the old admin-only RLS will reject the
    // INSERT for normal users; in that case we surface an empty list rather
    // than crashing the whole page.
    try {
      await seedGearCategories(supabase, profileId);
      const reseed = await supabase
        .from("gear_categories")
        .select("*")
        .eq("profile_id", profileId)
        .order("sort_order", { ascending: true });
      if (!reseed.error) catRows = reseed.data ?? [];
    } catch {
      // swallow — UI will render the empty-categories state
    }
  }

  return {
    profileId,
    profile: gearProfileFromDb(profileRes.data as DbProfile),
    settings: gearSettingsFromDb(settingsRes.data as DbGearPageSettings | null),
    categories: (catRows ?? []).map((row) =>
      gearCategoryFromDb(row as DbGearCategory),
    ),
    items: (itemRes.data ?? []).map((row) =>
      gearItemFromDb(row as DbGearItem),
    ),
  };
}

/** Legacy: site marketing gear (slug = "main"). Kept so /gear still works. */
export async function fetchGearPage(
  supabase: SupabaseClient,
  options?: { includeDisabled?: boolean },
): Promise<GearPageData & { profileId: string }> {
  const profileId = await resolveProfileId(supabase);
  return loadGearForProfile(supabase, profileId, {
    includeDisabled: options?.includeDisabled,
    seedIfEmpty: true,
  });
}

/**
 * Public gear page for a specific creator's slug.
 * Returns null when the profile doesn't exist or hasn't opted in to gear.
 * RLS handles the actual data-access guard; this also avoids spending a
 * round-trip when we already know the page should not be shown.
 */
export async function fetchGearPageBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<(GearPageData & { profileId: string }) | null> {
  const resolved = await resolveProfileBySlug(supabase, slug);
  if (!resolved) return null;
  if (!resolved.gear_enabled) return null;
  return loadGearForProfile(supabase, resolved.id, { includeDisabled: false });
}

/**
 * Owner-mode fetch for the dashboard. Loads the signed-in user's gear
 * including disabled items so they can edit them. Auto-seeds default
 * categories on first load.
 */
export async function fetchGearPageForUser(
  supabase: SupabaseClient,
): Promise<GearPageData & { profileId: string; gearEnabled: boolean }> {
  const resolved = await resolveOwnedProfile(supabase);
  const page = await loadGearForProfile(supabase, resolved.id, {
    includeDisabled: true,
    seedIfEmpty: true,
  });
  return { ...page, gearEnabled: Boolean(resolved.gear_enabled) };
}

/** Toggle the user's public gear visibility. Owner-only. */
export async function setGearEnabledForUser(
  supabase: SupabaseClient,
  enabled: boolean,
): Promise<void> {
  const resolved = await resolveOwnedProfile(supabase);
  const { error } = await supabase
    .from("profiles")
    .update({ gear_enabled: enabled })
    .eq("id", resolved.id);
  if (error) throw error;
}

export async function saveGearPageSettings(
  supabase: SupabaseClient,
  profileId: string,
  settings: GearPageSettings,
): Promise<void> {
  const { error } = await supabase.from("gear_page_settings").upsert({
    profile_id: profileId,
    setup_description: settings.setupDescription,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function saveGearCategories(
  supabase: SupabaseClient,
  profileId: string,
  categories: GearCategory[],
): Promise<void> {
  const rows = categories.map((c) => ({
    ...gearCategoryToDb(c, profileId),
    created_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("gear_categories").upsert(rows, {
    onConflict: "id",
  });
  if (error) throw error;
}

export async function createGearCategory(
  supabase: SupabaseClient,
  profileId: string,
  name: string,
  order: number,
): Promise<GearCategory> {
  const slug = slugifyCategory(name);
  const { data, error } = await supabase
    .from("gear_categories")
    .insert({
      profile_id: profileId,
      slug,
      name: name.trim(),
      sort_order: order,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return gearCategoryFromDb(data as DbGearCategory);
}

export async function deleteGearCategory(
  supabase: SupabaseClient,
  categoryId: string,
): Promise<void> {
  const { error } = await supabase
    .from("gear_categories")
    .delete()
    .eq("id", categoryId);
  if (error) throw error;
}

/** Update sort order only — avoids overwriting price/media from stale client state. */
export async function reorderGearItems(
  supabase: SupabaseClient,
  ordered: { id: string; order: number }[],
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const results = await Promise.all(
    ordered.map(({ id, order }) =>
      supabase
        .from("gear_items")
        .update({ sort_order: order, updated_at: updatedAt })
        .eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function createGearItem(
  supabase: SupabaseClient,
  profileId: string,
  item: GearItem,
): Promise<GearItem> {
  const row = {
    ...gearItemToDb(item, profileId),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("gear_items")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return gearItemFromDb(data as DbGearItem);
}

export async function updateGearItem(
  supabase: SupabaseClient,
  profileId: string,
  item: GearItem,
): Promise<GearItem> {
  const row = gearItemToDb(item, profileId);
  const { data, error } = await supabase
    .from("gear_items")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", item.id)
    .select()
    .single();
  if (error) throw error;
  return gearItemFromDb(data as DbGearItem);
}

export async function deleteGearItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase.from("gear_items").delete().eq("id", itemId);
  if (error) throw error;
}
