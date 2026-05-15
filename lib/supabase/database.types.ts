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

export interface DbCollection {
  id: string;
  profile_id: string;
  slug: string;
  title: string;
  description: string;
  hero_gif_url: string | null;
  hero_image_url: string | null;
  hero_image_storage_path: string | null;
  hero_gif_storage_path: string | null;
  hero_video_url: string | null;
  review_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  accent_color: string | null;
  gradient_preset: string;
  layout_style: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbCollectionGalleryImage {
  id: string;
  collection_id: string;
  url: string;
  alt: string;
  sort_order: number;
  created_at: string;
}

export interface DbCollectionProduct {
  id: string;
  collection_id: string;
  title: string;
  description: string;
  image_url: string | null;
  image_storage_path: string | null;
  gif_url: string | null;
  gif_storage_path: string | null;
  affiliate_url: string;
  cta_label: string;
  review_text: string | null;
  category: string | null;
  tags: string[];
  sort_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const STORAGE_BUCKET = "hub-assets";
