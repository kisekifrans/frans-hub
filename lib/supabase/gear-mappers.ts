import {
  normalizeGearCurrency,
  normalizeGearPrice,
} from "@/lib/gear/price";
import { ensureCacheBustUrl, mediaUrlWithoutVersion } from "@/lib/media-url";
import { parseThumbnailFocus } from "@/lib/thumbnail-focus";
import type { GearCategory, GearItem, GearPageSettings } from "@/lib/gear/types";
import type { SocialLink, SocialPlatform } from "@/lib/types";
import type {
  DbGearCategory,
  DbGearItem,
  DbGearPageSettings,
  DbProfile,
  DbSocialLink,
} from "./database.types";
import type { GearPageProfile } from "@/lib/gear/types";

const SOCIAL_PLATFORMS = new Set<SocialPlatform>([
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
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

export function gearCategoryFromDb(row: DbGearCategory): GearCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    order: row.sort_order,
  };
}

export function gearItemFromDb(row: DbGearItem): GearItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description ?? "",
    imageUrl: ensureCacheBustUrl(
      row.image_url,
      new Date(row.updated_at).getTime(),
    ),
    storagePath: row.storage_path ?? undefined,
    imageFocus: parseThumbnailFocus(row.image_focus),
    productUrl: row.product_url ?? undefined,
    price: normalizeGearPrice(row.price),
    priceCurrency: normalizeGearCurrency(row.price_currency),
    featured: row.featured,
    enabled: row.enabled,
    order: row.sort_order,
    createdAt: row.created_at,
  };
}

export function gearItemToDb(
  item: GearItem,
  profileId: string,
): Omit<DbGearItem, "created_at" | "updated_at"> {
  return {
    id: item.id,
    profile_id: profileId,
    category_id: item.categoryId,
    name: item.name,
    description: item.description,
    image_url: item.imageUrl
      ? mediaUrlWithoutVersion(item.imageUrl)
      : null,
    storage_path: item.storagePath ?? null,
    image_focus: item.imageFocus ?? null,
    product_url: item.productUrl ?? null,
    price: normalizeGearPrice(item.price),
    price_currency: normalizeGearCurrency(item.priceCurrency),
    featured: item.featured,
    enabled: item.enabled,
    sort_order: item.order,
  };
}

export function gearCategoryToDb(
  cat: GearCategory,
  profileId: string,
): Omit<DbGearCategory, "created_at"> {
  return {
    id: cat.id,
    profile_id: profileId,
    slug: cat.slug,
    name: cat.name,
    sort_order: cat.order,
  };
}

export function gearSettingsFromDb(
  row: DbGearPageSettings | null,
): GearPageSettings {
  return {
    setupDescription: row?.setup_description ?? "",
  };
}

export function gearProfileFromDb(row: DbProfile): GearPageProfile {
  return {
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url ?? "",
    verified: Boolean(row.verified),
    socialLinks: socialLinksFromDb(row.social_links),
    theme: row.theme,
  };
}
