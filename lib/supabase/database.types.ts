export type DbTheme = "violet" | "cyan" | "rose" | "emerald";
export type DbBlockType = "link" | "gif" | "tiktok" | "instagram";
export type DbThumbnailLayout = "side" | "banner";

export interface DbSocialLink {
  platform: string;
  url: string;
}

export interface DbProfile {
  id: string;
  slug: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  avatar_storage_path: string | null;
  verified: boolean;
  social_links: DbSocialLink[];
  theme: DbTheme;
  created_at: string;
  updated_at: string;
}

export interface DbBlock {
  id: string;
  profile_id: string;
  type: DbBlockType;
  enabled: boolean;
  sort_order: number;
  title: string | null;
  url: string | null;
  accent: string | null;
  thumbnail_url: string | null;
  thumbnail_layout: DbThumbnailLayout | null;
  storage_path: string | null;
  alt: string | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAnalyticsEvent {
  id: string;
  profile_id: string;
  block_id: string | null;
  event_type: "view" | "click";
  visitor_id: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

export const STORAGE_BUCKET = "hub-assets";
