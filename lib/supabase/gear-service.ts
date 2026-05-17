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

async function resolveProfileId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", PROFILE_SLUG)
    .single();
  if (error || !data) throw new Error("Profile not found");
  return data.id as string;
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

export async function fetchGearPage(
  supabase: SupabaseClient,
  options?: { includeDisabled?: boolean },
): Promise<GearPageData & { profileId: string }> {
  const profileId = await resolveProfileId(supabase);

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();
  if (profileError || !profileRow) throw profileError ?? new Error("No profile");

  const { data: settingsRow } = await supabase
    .from("gear_page_settings")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  let { data: catRows, error: catError } = await supabase
    .from("gear_categories")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true });

  if (catError) throw catError;

  if (!catRows?.length) {
    await seedGearCategories(supabase, profileId);
    const res = await supabase
      .from("gear_categories")
      .select("*")
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: true });
    catRows = res.data;
    catError = res.error;
    if (catError) throw catError;
  }

  let itemsQuery = supabase
    .from("gear_items")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true });

  if (!options?.includeDisabled) {
    itemsQuery = itemsQuery.eq("enabled", true);
  }

  const { data: itemRows, error: itemError } = await itemsQuery;
  if (itemError) throw itemError;

  const categories = (catRows as DbGearCategory[]).map(gearCategoryFromDb);
  const items = (itemRows as DbGearItem[]).map(gearItemFromDb);

  return {
    profileId,
    profile: gearProfileFromDb(profileRow as DbProfile),
    settings: gearSettingsFromDb(settingsRow as DbGearPageSettings | null),
    categories,
    items,
  };
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

export async function saveGearItems(
  supabase: SupabaseClient,
  profileId: string,
  items: GearItem[],
): Promise<void> {
  const rows = items.map((item) => ({
    ...gearItemToDb(item, profileId),
    updated_at: new Date().toISOString(),
    created_at: item.createdAt || new Date().toISOString(),
  }));
  const { error } = await supabase.from("gear_items").upsert(rows, {
    onConflict: "id",
  });
  if (error) throw error;
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
