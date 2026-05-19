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

export interface DbFinanceCategory {
  id: string;
  profile_id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  sort_order: number;
  is_default?: boolean;
  created_at: string;
}

export interface DbFinancePaymentMethod {
  id: string;
  profile_id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface DbFinanceBudgetPeriod {
  id: string;
  profile_id: string;
  name: string;
  start_date: string;
  end_date: string;
  salary_received: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFinanceBudgetLimit {
  id: string;
  profile_id: string;
  category_id: string;
  period_id: string;
  limit_amount: number;
  warning_threshold: number;
  created_at: string;
}

export interface DbFinanceTransaction {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category_id: string | null;
  payment_method_id: string | null;
  transaction_date: string;
  period_id: string | null;
  recurring: boolean;
  tags: string[];
  attachment_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFinanceSubscription {
  id: string;
  profile_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_payment_date: string;
  category_id: string | null;
  payment_method_id: string | null;
  auto_renew: boolean;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFinanceImportJob {
  id: string;
  profile_id: string;
  source: string;
  file_url: string | null;
  storage_path: string | null;
  original_filename: string | null;
  status: string;
  error_message: string | null;
  extracted_count: number;
  parsed_count?: number;
  preview_json: unknown;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const FINANCE_IMPORTS_BUCKET = "finance-imports";

export interface DbEdgeCase {
  id: string;
  episode_id: string | null;
  qa_url: string | null;
  uploaded_video_path: string | null;
  thumbnail_path: string | null;
  project_name: string | null;
  task_id: string | null;
  task_description: string | null;
  title: string;
  description: string;
  decision: string | null;
  reject_reason: string | null;
  tags: string[];
  notes: string | null;
  duration_seconds: number | null;
  file_size: number | null;
  mime_type: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export const EDGECASES_STORAGE_BUCKET = "edgecases-videos";

export const STORAGE_BUCKET = "hub-assets";
