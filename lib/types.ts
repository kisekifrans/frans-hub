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

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: "violet" | "cyan" | "rose" | "emerald";
  blocks: ProfileBlock[];
}

export interface AnalyticsSnapshot {
  totalViews: number;
  totalClicks: number;
  viewsByDay: Record<string, number>;
  clicksByBlock: Record<string, number>;
  clicksByDay: Record<string, number>;
  lastViewedAt?: string;
}

export interface AppData {
  profile: Profile;
  analytics: AnalyticsSnapshot;
}
