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
  thumbnail_focus: { x: number; y: number; scale?: number } | null;
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

export interface DbGearPageSettings {
  profile_id: string;
  setup_description: string;
  updated_at: string;
}

export interface DbGearCategory {
  id: string;
  profile_id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface DbGearItem {
  id: string;
  profile_id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string | null;
  storage_path: string | null;
  image_focus: { x: number; y: number; scale?: number } | null;
  product_url: string | null;
  price: number | null;
  price_currency: string;
  featured: boolean;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const STORAGE_BUCKET = "hub-assets";
