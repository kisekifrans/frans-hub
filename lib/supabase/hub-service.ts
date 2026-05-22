import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AnalyticsGranularity,
  AnalyticsPeriod,
  AnalyticsSnapshot,
  Profile,
  ProfileBlock,
} from "@/lib/types";
import { buildAnalyticsReport, periodStart } from "@/lib/analytics-report";
import { DEFAULT_DATA } from "@/lib/defaults";
import type { DbBlock, DbProfile } from "./database.types";
import { STORAGE_BUCKET } from "./database.types";
import { getSiteProfileSlug } from "@/lib/config/site-profile";
import {
  blockFromDb,
  blockTitlesFromProfile,
  blockToDb,
  profileFromDb,
  profileToDb,
} from "./mappers";

export type FetchHubOptions = {
  includeDisabled?: boolean;
  /** When false, unpublished profiles are hidden from public slug pages. */
  requirePublished?: boolean;
};

async function loadHubFromProfileRow(
  supabase: SupabaseClient,
  profileRow: DbProfile,
  options?: FetchHubOptions,
): Promise<{ profile: Profile; profileId: string; analytics: AnalyticsSnapshot }> {
  let blocksQuery = supabase
    .from("blocks")
    .select("*")
    .eq("profile_id", profileRow.id)
    .order("sort_order", { ascending: true });

  if (!options?.includeDisabled) {
    blocksQuery = blocksQuery.eq("enabled", true);
  }

  const { data: blockRows, error: blocksError } = await blocksQuery;
  if (blocksError) throw blocksError;

  const blocks = (blockRows as DbBlock[]).map(blockFromDb);
  const profile = profileFromDb(profileRow, blocks);
  const analytics = await fetchAnalytics(supabase, profileRow.id, {
    blockTitles: blockTitlesFromProfile(blocks),
  });

  return {
    profile,
    profileId: profileRow.id,
    analytics,
  };
}

export async function fetchHubBySlug(
  supabase: SupabaseClient,
  slug: string,
  options?: FetchHubOptions,
): Promise<{ profile: Profile; profileId: string; analytics: AnalyticsSnapshot } | null> {
  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profileRow) return null;

  const published = (profileRow as DbProfile & { is_published?: boolean })
    .is_published;
  if (options?.requirePublished && published === false) return null;

  return loadHubFromProfileRow(supabase, profileRow as DbProfile, options);
}

export async function fetchHubForUser(
  supabase: SupabaseClient,
  options?: FetchHubOptions,
): Promise<{ profile: Profile; profileId: string; analytics: AnalyticsSnapshot }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Not authenticated");

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!profileRow) {
    throw new Error("No profile for this account. Try signing in again.");
  }

  return loadHubFromProfileRow(supabase, profileRow as DbProfile, {
    ...options,
    includeDisabled: true,
  });
}

/** Site marketing hub (`main` slug). */
export async function fetchHub(
  supabase: SupabaseClient,
  options?: FetchHubOptions,
): Promise<{ profile: Profile; profileId: string; analytics: AnalyticsSnapshot }> {
  const siteSlug = getSiteProfileSlug();
  const hub = await fetchHubBySlug(supabase, siteSlug, options);
  if (hub) return hub;

  await seedHub(supabase);
  const retry = await fetchHubBySlug(supabase, siteSlug, options);
  if (!retry) throw new Error("Profile not found");
  return retry;
}

export interface FetchAnalyticsOptions {
  period?: AnalyticsPeriod;
  granularity?: AnalyticsGranularity;
  blockTitles?: Record<string, string>;
}

export async function fetchAnalytics(
  supabase: SupabaseClient,
  profileId: string,
  options: FetchAnalyticsOptions = {},
): Promise<AnalyticsSnapshot> {
  const period = options.period ?? "30d";
  const granularity = options.granularity ?? "daily";
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("analytics_events")
    .select(
      "event_type, block_id, created_at, visitor_id, device_type, browser, os",
    )
    .eq("profile_id", profileId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(10000);

  if (error) throw error;

  return buildAnalyticsReport(data ?? [], {
    period,
    granularity,
    blockTitles: options.blockTitles ?? {},
  });
}

export async function saveProfile(
  supabase: SupabaseClient,
  profileId: string,
  profile: Profile,
  slug?: string,
): Promise<void> {
  const row = profileToDb(
    profile,
    profileId,
    slug ?? profile.slug ?? getSiteProfileSlug(),
  );
  const { error } = await supabase
    .from("profiles")
    .update({
      username: row.username,
      display_name: row.display_name,
      bio: row.bio,
      avatar_url: row.avatar_url,
      avatar_storage_path: row.avatar_storage_path,
      verified: row.verified,
      social_links: row.social_links,
      theme: row.theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);
  if (error) throw error;
}

export async function saveBlocks(
  supabase: SupabaseClient,
  profileId: string,
  blocks: ProfileBlock[],
): Promise<void> {
  const rows = blocks.map((b) => blockToDb(b, profileId));
  const { error } = await supabase.from("blocks").upsert(
    rows.map((r) => ({
      ...r,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function createBlock(
  supabase: SupabaseClient,
  profileId: string,
  block: ProfileBlock,
): Promise<ProfileBlock> {
  const row = {
    ...blockToDb(block, profileId),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("blocks").insert(row).select().single();
  if (error) throw error;
  return blockFromDb(data as DbBlock);
}

export async function updateBlock(
  supabase: SupabaseClient,
  block: ProfileBlock,
  profileId: string,
): Promise<void> {
  const row = blockToDb(block, profileId);
  const { error } = await supabase
    .from("blocks")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", block.id);
  if (error) throw error;
}

export async function deleteBlock(
  supabase: SupabaseClient,
  profileId: string,
  blockId: string,
): Promise<void> {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", blockId)
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function reorderBlocks(
  supabase: SupabaseClient,
  blocks: ProfileBlock[],
  profileId: string,
): Promise<void> {
  await saveBlocks(supabase, profileId, blocks);
}

export async function trackEvent(
  supabase: SupabaseClient,
  profileId: string,
  eventType: "view" | "click",
  blockId?: string,
): Promise<void> {
  const { error } = await supabase.from("analytics_events").insert({
    profile_id: profileId,
    block_id: blockId ?? null,
    event_type: eventType,
  });
  if (error) throw error;
}

export async function uploadAsset(
  supabase: SupabaseClient,
  file: File,
  path: string,
  options?: { cacheControl?: string; contentType?: string },
): Promise<{ publicUrl: string; storagePath: string }> {
  const contentType =
    options?.contentType && options.contentType.startsWith("image/")
      ? options.contentType
      : file.type?.startsWith("image/")
        ? file.type
        : "image/jpeg";

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      upsert: true,
      cacheControl: options?.cacheControl ?? "3600",
      contentType,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, storagePath: path };
}

export async function removeAsset(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
}

async function seedHub(supabase: SupabaseClient): Promise<void> {
  const seed = DEFAULT_DATA.profile;
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      slug: getSiteProfileSlug(),
      username: seed.username,
      display_name: seed.displayName,
      bio: seed.bio,
      avatar_url: seed.avatarUrl,
      verified: seed.verified,
      social_links: seed.socialLinks.map((l) => ({
        platform: l.platform,
        url: l.url,
      })),
      theme: seed.theme,
    })
    .select()
    .single();

  if (error) throw error;

  const blocks = DEFAULT_DATA.profile.blocks.map((b, i) =>
    blockToDb({ ...b, order: i }, profile.id),
  );

  await supabase.from("blocks").insert(
    blocks.map((b) => ({
      ...b,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  );
}

export function assetPath(
  profileId: string,
  folder: "thumbnails" | "gifs" | "avatars" | "gear",
  filename: string,
): string {
  return `${profileId}/${folder}/${filename}`;
}
