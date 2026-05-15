import type { SupabaseClient } from "@supabase/supabase-js";
import type { Collection, CollectionProduct } from "@/lib/types";
import type {
  DbCollection,
  DbCollectionGalleryImage,
  DbCollectionProduct,
} from "./database.types";
import {
  collectionFromDb,
  collectionToDb,
  galleryFromDb,
  galleryToDb,
  normalizeCollectionSlug,
  productFromDb,
  productToDb,
} from "./collection-mappers";

const PROFILE_SLUG = "main";

export async function getAdminProfileId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", PROFILE_SLUG)
    .single();
  return data?.id ?? null;
}

export async function fetchCollectionsAdmin(
  supabase: SupabaseClient,
  profileId: string,
): Promise<Collection[]> {
  const { data: rows, error } = await supabase
    .from("collections")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  const collections: Collection[] = [];
  for (const row of (rows ?? []) as DbCollection[]) {
    const full = await fetchCollectionByIdAdmin(supabase, row.id);
    if (full) collections.push(full);
  }
  return collections;
}

export async function fetchCollectionByIdAdmin(
  supabase: SupabaseClient,
  collectionId: string,
): Promise<Collection | null> {
  const { data: row, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (error || !row) return null;

  const [{ data: galleryRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("collection_gallery_images")
      .select("*")
      .eq("collection_id", collectionId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("collection_products")
      .select("*")
      .eq("collection_id", collectionId)
      .order("sort_order", { ascending: true }),
  ]);

  const gallery = ((galleryRows ?? []) as DbCollectionGalleryImage[]).map(
    galleryFromDb,
  );
  const products = ((productRows ?? []) as DbCollectionProduct[]).map((r) =>
    productFromDb(r),
  );

  return collectionFromDb(row as DbCollection, gallery, products);
}

export async function createCollectionAdmin(
  supabase: SupabaseClient,
  profileId: string,
  partial?: Partial<Pick<Collection, "title" | "slug">>,
): Promise<Collection> {
  const id = crypto.randomUUID();
  const slug = normalizeCollectionSlug(partial?.slug ?? `collection-${Date.now().toString(36)}`);
  const { data: existing } = await supabase
    .from("collections")
    .select("sort_order")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0
      ? (existing[0] as { sort_order: number }).sort_order + 1
      : 0;

  const draft: Collection = {
    id,
    slug,
    title: partial?.title ?? "New collection",
    description: "",
    gradientPreset: "violet",
    layoutStyle: "editorial",
    enabled: false,
    order: nextOrder,
    gallery: [],
    products: [],
  };

  const row = {
    ...collectionToDb(draft, profileId),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("collections").insert(row);
  if (error) throw error;

  const created = await fetchCollectionByIdAdmin(supabase, id);
  if (!created) throw new Error("Collection created but not found");
  return created;
}

export async function saveCollectionAdmin(
  supabase: SupabaseClient,
  profileId: string,
  collection: Collection,
): Promise<Collection> {
  const normalized: Collection = {
    ...collection,
    slug: normalizeCollectionSlug(collection.slug),
    gallery: collection.gallery.map((g, i) => ({ ...g, order: i })),
    products: collection.products.map((p, i) => ({ ...p, order: i })),
  };

  const row = {
    ...collectionToDb(normalized, profileId),
    updated_at: new Date().toISOString(),
  };

  const { error: colError } = await supabase
    .from("collections")
    .upsert(row, { onConflict: "id" });
  if (colError) throw colError;

  const collectionId = normalized.id;

  const { data: existingGallery } = await supabase
    .from("collection_gallery_images")
    .select("id")
    .eq("collection_id", collectionId);
  const keepGalleryIds = new Set(normalized.gallery.map((g) => g.id));
  const toDeleteGallery = (existingGallery ?? [])
    .map((r) => r.id as string)
    .filter((id) => !keepGalleryIds.has(id));
  if (toDeleteGallery.length > 0) {
    await supabase
      .from("collection_gallery_images")
      .delete()
      .in("id", toDeleteGallery);
  }

  if (normalized.gallery.length > 0) {
    const galleryRows = normalized.gallery.map((g) => galleryToDb(g, collectionId));
    const { error: gErr } = await supabase
      .from("collection_gallery_images")
      .upsert(galleryRows, { onConflict: "id" });
    if (gErr) throw gErr;
  }

  const { data: existingProducts } = await supabase
    .from("collection_products")
    .select("id")
    .eq("collection_id", collectionId);
  const keepProductIds = new Set(normalized.products.map((p) => p.id));
  const toDeleteProducts = (existingProducts ?? [])
    .map((r) => r.id as string)
    .filter((id) => !keepProductIds.has(id));
  if (toDeleteProducts.length > 0) {
    await supabase.from("collection_products").delete().in("id", toDeleteProducts);
  }

  if (normalized.products.length > 0) {
    const productRows = normalized.products.map((p) => ({
      ...productToDb(p, collectionId),
      updated_at: new Date().toISOString(),
    }));
    const { error: pErr } = await supabase
      .from("collection_products")
      .upsert(productRows, { onConflict: "id" });
    if (pErr) throw pErr;
  }

  const saved = await fetchCollectionByIdAdmin(supabase, collectionId);
  if (!saved) throw new Error("Save succeeded but reload failed");
  return saved;
}

export async function deleteCollectionAdmin(
  supabase: SupabaseClient,
  collectionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId);
  if (error) throw error;
}

export function createEmptyProduct(order: number): CollectionProduct {
  const id = crypto.randomUUID();
  return {
    id,
    title: "New pick",
    description: "",
    affiliateUrl: "https://",
    ctaLabel: "Shop now",
    tags: [],
    order,
    enabled: true,
  };
}

export function createEmptyGalleryImage(order: number) {
  const id = crypto.randomUUID();
  return {
    id,
    url: "",
    alt: "",
    order,
  };
}

export async function isCollectionSlugAvailable(
  supabase: SupabaseClient,
  profileId: string,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const normalized = normalizeCollectionSlug(slug);
  let query = supabase
    .from("collections")
    .select("id")
    .eq("profile_id", profileId)
    .eq("slug", normalized);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return !data;
}
