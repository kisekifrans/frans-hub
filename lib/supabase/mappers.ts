import type { DbBlock, DbProfile } from "./database.types";
import type { AnalyticsSnapshot, Profile, ProfileBlock } from "@/lib/types";

export function blockFromDb(row: DbBlock): ProfileBlock {
  const base = {
    id: row.id,
    type: row.type,
    enabled: row.enabled,
    order: row.sort_order,
  };

  switch (row.type) {
    case "link":
      return {
        ...base,
        type: "link",
        title: row.title ?? "Untitled",
        url: row.url ?? "",
        accent: row.accent ?? undefined,
        thumbnailUrl: row.thumbnail_url ?? undefined,
        thumbnailLayout: row.thumbnail_layout ?? undefined,
        storagePath: row.storage_path ?? undefined,
      };
    case "gif":
      return {
        ...base,
        type: "gif",
        url: row.thumbnail_url ?? row.url ?? "",
        alt: row.alt ?? undefined,
        caption: row.caption ?? undefined,
        storagePath: row.storage_path ?? undefined,
      };
    case "tiktok":
      return { ...base, type: "tiktok", url: row.url ?? "" };
    case "instagram":
      return { ...base, type: "instagram", url: row.url ?? "" };
    default:
      return { ...base, type: "link", title: "", url: "" };
  }
}

export function blockToDb(
  block: ProfileBlock,
  profileId: string,
): Omit<DbBlock, "created_at" | "updated_at"> {
  const common = {
    id: block.id,
    profile_id: profileId,
    type: block.type,
    enabled: block.enabled,
    sort_order: block.order,
    title: null as string | null,
    url: null as string | null,
    accent: null as string | null,
    thumbnail_url: null as string | null,
    thumbnail_layout: null as DbBlock["thumbnail_layout"],
    storage_path:
      "storagePath" in block ? (block.storagePath ?? null) : null,
    alt: null as string | null,
    caption: null as string | null,
  };

  switch (block.type) {
    case "link":
      return {
        ...common,
        title: block.title,
        url: block.url,
        accent: block.accent ?? null,
        thumbnail_url: block.thumbnailUrl ?? null,
        thumbnail_layout: block.thumbnailLayout ?? null,
      };
    case "gif":
      return {
        ...common,
        url: block.url,
        thumbnail_url: block.url,
        alt: block.alt ?? null,
        caption: block.caption ?? null,
      };
    case "tiktok":
    case "instagram":
      return { ...common, url: block.url };
    default:
      return common;
  }
}

export function profileFromDb(
  row: DbProfile,
  blocks: ProfileBlock[],
): Profile {
  return {
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url ?? "",
    theme: row.theme,
    blocks,
  };
}

export function profileToDb(
  profile: Profile,
  profileId: string,
  slug: string,
): Pick<
  DbProfile,
  "id" | "slug" | "username" | "display_name" | "bio" | "avatar_url" | "theme"
> {
  return {
    id: profileId,
    slug,
    username: profile.username,
    display_name: profile.displayName,
    bio: profile.bio,
    avatar_url: profile.avatarUrl || null,
    theme: profile.theme,
  };
}

export function aggregateAnalytics(
  events: { event_type: string; block_id: string | null; created_at: string }[],
): AnalyticsSnapshot {
  const viewsByDay: Record<string, number> = {};
  const clicksByDay: Record<string, number> = {};
  const clicksByBlock: Record<string, number> = {};
  let totalViews = 0;
  let totalClicks = 0;

  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    if (e.event_type === "view") {
      totalViews++;
      viewsByDay[day] = (viewsByDay[day] ?? 0) + 1;
    } else if (e.event_type === "click") {
      totalClicks++;
      clicksByDay[day] = (clicksByDay[day] ?? 0) + 1;
      if (e.block_id) {
        clicksByBlock[e.block_id] = (clicksByBlock[e.block_id] ?? 0) + 1;
      }
    }
  }

  return {
    totalViews,
    totalClicks,
    viewsByDay,
    clicksByDay,
    clicksByBlock,
  };
}
