import type {
  DbCollection,
  DbCollectionGalleryImage,
  DbCollectionProduct,
} from "./database.types";
import type {
  Collection,
  CollectionGalleryImage,
  CollectionGradientPreset,
  CollectionLayoutStyle,
  CollectionProduct,
} from "@/lib/types";

const GRADIENTS = new Set<CollectionGradientPreset>([
  "violet",
  "rose",
  "fuchsia",
  "sunset",
  "midnight",
]);
const LAYOUTS = new Set<CollectionLayoutStyle>([
  "editorial",
  "grid",
  "compact",
]);

function parseGradient(v: string | null | undefined): CollectionGradientPreset {
  if (v && GRADIENTS.has(v as CollectionGradientPreset)) {
    return v as CollectionGradientPreset;
  }
  return "violet";
}

function parseLayout(v: string | null | undefined): CollectionLayoutStyle {
  if (v && LAYOUTS.has(v as CollectionLayoutStyle)) {
    return v as CollectionLayoutStyle;
  }
  return "editorial";
}

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

export function galleryFromDb(row: DbCollectionGalleryImage): CollectionGalleryImage {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt,
    order: row.sort_order,
  };
}

export function productFromDb(row: DbCollectionProduct): CollectionProduct {
  const product: CollectionProduct = {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    imageStoragePath: row.image_storage_path ?? undefined,
    gifUrl: row.gif_url ?? undefined,
    gifStoragePath: row.gif_storage_path ?? undefined,
    affiliateUrl: row.affiliate_url,
    ctaLabel: row.cta_label,
    reviewText: row.review_text ?? undefined,
    category: row.category ?? undefined,
    tags: parseTags(row.tags),
    order: row.sort_order,
    enabled: row.enabled,
  };
  return product;
}

export function collectionFromDb(
  row: DbCollection,
  gallery: CollectionGalleryImage[],
  products: CollectionProduct[],
  options?: { publicView?: boolean },
): Collection {
  const visibleProducts = options?.publicView
    ? products.filter((p) => p.enabled)
    : products;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    heroGifUrl: row.hero_gif_url ?? undefined,
    heroGifStoragePath: row.hero_gif_storage_path ?? undefined,
    heroImageUrl: row.hero_image_url ?? undefined,
    heroImageStoragePath: row.hero_image_storage_path ?? undefined,
    heroVideoUrl: row.hero_video_url ?? undefined,
    reviewText: row.review_text ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    accentColor: row.accent_color ?? undefined,
    gradientPreset: parseGradient(row.gradient_preset),
    layoutStyle: parseLayout(row.layout_style),
    enabled: row.enabled,
    order: row.sort_order,
    gallery,
    products: visibleProducts,
  };
}

export function collectionToDb(
  collection: Collection,
  profileId: string,
): Omit<DbCollection, "created_at" | "updated_at"> {
  return {
    id: collection.id,
    profile_id: profileId,
    slug: collection.slug.toLowerCase().trim(),
    title: collection.title,
    description: collection.description,
    hero_gif_url: collection.heroGifUrl ?? null,
    hero_gif_storage_path: collection.heroGifStoragePath ?? null,
    hero_image_url: collection.heroImageUrl ?? null,
    hero_image_storage_path: collection.heroImageStoragePath ?? null,
    hero_video_url: collection.heroVideoUrl ?? null,
    review_text: collection.reviewText ?? null,
    seo_title: collection.seoTitle ?? null,
    seo_description: collection.seoDescription ?? null,
    accent_color: collection.accentColor ?? null,
    gradient_preset: collection.gradientPreset,
    layout_style: collection.layoutStyle,
    enabled: collection.enabled,
    sort_order: collection.order,
  };
}

export function galleryToDb(
  image: CollectionGalleryImage,
  collectionId: string,
): Omit<DbCollectionGalleryImage, "created_at"> {
  return {
    id: image.id,
    collection_id: collectionId,
    url: image.url,
    alt: image.alt,
    sort_order: image.order,
  };
}

export function productToDb(
  product: CollectionProduct,
  collectionId: string,
): Omit<DbCollectionProduct, "created_at" | "updated_at"> {
  return {
    id: product.id,
    collection_id: collectionId,
    title: product.title,
    description: product.description,
    image_url: product.imageUrl ?? null,
    image_storage_path: product.imageStoragePath ?? null,
    gif_url: product.gifUrl ?? null,
    gif_storage_path: product.gifStoragePath ?? null,
    affiliate_url: product.affiliateUrl,
    cta_label: product.ctaLabel,
    review_text: product.reviewText ?? null,
    category: product.category ?? null,
    tags: product.tags,
    sort_order: product.order,
    enabled: product.enabled,
  };
}

export function normalizeCollectionSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
