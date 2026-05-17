import type { ThumbnailFocus } from "@/lib/thumbnail-focus";
import type { Profile, SocialLink } from "@/lib/types";

export interface GearCategory {
  id: string;
  slug: string;
  name: string;
  order: number;
}

export interface GearItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl?: string;
  storagePath?: string;
  imageFocus?: ThumbnailFocus;
  productUrl?: string;
  price?: number | null;
  priceCurrency: string;
  featured: boolean;
  enabled: boolean;
  order: number;
  createdAt: string;
}

export interface GearPageSettings {
  setupDescription: string;
}

export interface GearPageProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  socialLinks: SocialLink[];
  theme: Profile["theme"];
}

export interface GearCategoryGroup {
  category: GearCategory;
  items: GearItem[];
}

export interface GearPageData {
  profile: GearPageProfile;
  settings: GearPageSettings;
  categories: GearCategory[];
  items: GearItem[];
}

export const DEFAULT_GEAR_CATEGORY_NAMES = [
  "Mouse",
  "Keyboard",
  "Mousepad",
  "Audio",
  "Headphones",
  "IEM",
  "Monitor",
  "Microphone",
  "Chair",
  "Camera",
  "PC Specs",
  "Accessories",
] as const;
