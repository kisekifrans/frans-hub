import type { SupabaseClient } from "@supabase/supabase-js";
import { getCatalogCollection } from "@/lib/collection-catalog";
import type { CollectionPageData } from "@/lib/types";
import type {
  DbCollection,
  DbCollectionGalleryImage,
  DbCollectionProduct,
} from "./database.types";
import {
  collectionFromDb,
  galleryFromDb,
  productFromDb,
} from "./collection-mappers";

const PROFILE_SLUG = "main";

export async function fetchCollectionPage(
  supabase: SupabaseClient,
  slug: string,
): Promise<CollectionPageData | null> {
  const normalized = slug.toLowerCase();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, theme")
    .eq("slug", PROFILE_SLUG)
    .single();

  if (profileError || !profileRow) {
    return getCatalogCollection(normalized);
  }

  const { data: collectionRow, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("profile_id", profileRow.id)
    .eq("slug", normalized)
    .eq("enabled", true)
    .maybeSingle();

  if (collectionError) {
    if (collectionError.code === "42P01") {
      return mergeCatalogWithProfile(normalized, profileRow);
    }
    throw collectionError;
  }

  if (!collectionRow) {
    const catalog = getCatalogCollection(normalized);
    if (!catalog) return null;
    return {
      ...catalog,
      profileId: profileRow.id,
      theme: profileRow.theme,
      creatorName: profileRow.display_name,
    };
  }

  const collectionId = (collectionRow as DbCollection).id;

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
      .eq("enabled", true)
      .order("sort_order", { ascending: true }),
  ]);

  const gallery = ((galleryRows ?? []) as DbCollectionGalleryImage[]).map(
    galleryFromDb,
  );
  const products = ((productRows ?? []) as DbCollectionProduct[]).map((r) =>
    productFromDb(r),
  );

  return {
    collection: collectionFromDb(
      collectionRow as DbCollection,
      gallery,
      products,
      { publicView: true },
    ),
    profileId: profileRow.id,
    theme: profileRow.theme,
    creatorName: profileRow.display_name,
  };
}

function mergeCatalogWithProfile(
  slug: string,
  profileRow: { id: string; display_name: string; theme: CollectionPageData["theme"] },
): CollectionPageData | null {
  const catalog = getCatalogCollection(slug);
  if (!catalog) return null;
  return {
    ...catalog,
    profileId: profileRow.id,
    theme: profileRow.theme,
    creatorName: profileRow.display_name,
  };
}
