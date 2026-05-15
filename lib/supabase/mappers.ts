import { buildAnalyticsReport } from "@/lib/analytics-report";
import type { DbBlock, DbProfile, DbSocialLink } from "./database.types";
import type {
  AnalyticsSnapshot,
  Profile,
  ProfileBlock,
  SocialLink,
  SocialPlatform,
} from "@/lib/types";

const SOCIAL_PLATFORMS = new Set<SocialPlatform>([
  "instagram",
  "tiktok",
  "youtube",
  "x",
  "website",
]);

function socialLinksFromDb(raw: DbSocialLink[] | null | undefined): SocialLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is DbSocialLink =>
        l != null &&
        typeof l.platform === "string" &&
        typeof l.url === "string" &&
        SOCIAL_PLATFORMS.has(l.platform as SocialPlatform),
    )
    .map((l) => ({
      platform: l.platform as SocialPlatform,
      url: l.url.trim(),
    }))
    .filter((l) => l.url.length > 0);
}

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
    avatarStoragePath: row.avatar_storage_path ?? undefined,
    verified: Boolean(row.verified),
    socialLinks: socialLinksFromDb(row.social_links ?? []),
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
  | "id"
  | "slug"
  | "username"
  | "display_name"
  | "bio"
  | "avatar_url"
  | "avatar_storage_path"
  | "verified"
  | "social_links"
  | "theme"
> {
  return {
    id: profileId,
    slug,
    username: profile.username,
    display_name: profile.displayName,
    bio: profile.bio,
    avatar_url: profile.avatarUrl || null,
    avatar_storage_path: profile.avatarStoragePath ?? null,
    verified: profile.verified,
    social_links: profile.socialLinks.map((l) => ({
      platform: l.platform,
      url: l.url,
    })),
    theme: profile.theme,
  };
}

export function aggregateAnalytics(
  events: {
    event_type: string;
    block_id: string | null;
    created_at: string;
    visitor_id?: string | null;
    device_type?: string | null;
    browser?: string | null;
    os?: string | null;
  }[],
  blockTitles: Record<string, string> = {},
): AnalyticsSnapshot {
  return buildAnalyticsReport(events, {
    period: "30d",
    granularity: "daily",
    blockTitles,
  });
}

export function blockTitlesFromProfile(blocks: ProfileBlock[]): Record<string, string> {
  const titles: Record<string, string> = {};
  for (const b of blocks) {
    if (b.type === "link") titles[b.id] = b.title;
  }
  return titles;
}
