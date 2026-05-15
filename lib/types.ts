export type BlockType = "link" | "gif" | "tiktok" | "instagram";

export interface BaseBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  order: number;
}

export type LinkThumbnailLayout = "side" | "banner";

export interface LinkBlock extends BaseBlock {
  type: "link";
  title: string;
  url: string;
  icon?: string;
  accent?: string;
  /** Optional image shown on the link card */
  thumbnailUrl?: string;
  /** side = square thumb left; banner = wide image above title */
  thumbnailLayout?: LinkThumbnailLayout;
  storagePath?: string;
}

export interface GifBlock extends BaseBlock {
  type: "gif";
  url: string;
  alt?: string;
  caption?: string;
  storagePath?: string;
}

export interface TikTokBlock extends BaseBlock {
  type: "tiktok";
  url: string;
}

export interface InstagramBlock extends BaseBlock {
  type: "instagram";
  url: string;
}

export type ProfileBlock = LinkBlock | GifBlock | TikTokBlock | InstagramBlock;

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "website";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "x", label: "X" },
  { id: "website", label: "Website" },
];

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  avatarStoragePath?: string;
  verified: boolean;
  socialLinks: SocialLink[];
  theme: "violet" | "cyan" | "rose" | "emerald";
  blocks: ProfileBlock[];
}

export type AnalyticsPeriod = "7d" | "30d" | "90d";
export type AnalyticsGranularity = "daily" | "weekly" | "monthly";

export interface AnalyticsSeriesPoint {
  key: string;
  label: string;
  views: number;
  clicks: number;
}

export interface TopLinkStat {
  blockId: string;
  title: string;
  clicks: number;
  share: number;
}

export interface AnalyticsSnapshot {
  period: AnalyticsPeriod;
  granularity: AnalyticsGranularity;
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  series: AnalyticsSeriesPoint[];
  topLinks: TopLinkStat[];
  devices: Record<string, number>;
  browsers: Record<string, number>;
  /** @deprecated Legacy shape — derived from series for MiniChart */
  viewsByDay: Record<string, number>;
  clicksByBlock: Record<string, number>;
  clicksByDay: Record<string, number>;
  lastViewedAt?: string;
}

export interface AppData {
  profile: Profile;
  analytics: AnalyticsSnapshot;
}
