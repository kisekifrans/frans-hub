import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPageView } from "@/components/collection/CollectionPageView";
import { getCatalogCollection } from "@/lib/collection-catalog";
import { isReservedSlug } from "@/lib/reserved-routes";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchCollectionPage } from "@/lib/supabase/collections-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return {};

  const page = await loadCollectionPage(slug);
  if (!page) {
    return { title: "Not found" };
  }

  const { collection } = page;
  const title = collection.seoTitle ?? collection.title;
  const description =
    collection.seoDescription ?? collection.description ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function loadCollectionPage(slug: string) {
  const normalized = slug.toLowerCase();
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      return await fetchCollectionPage(supabase, normalized);
    } catch {
      return getCatalogCollection(normalized);
    }
  }
  return getCatalogCollection(normalized);
}

export default async function CollectionRoute({ params }: PageProps) {
  const { slug } = await params;

  if (isReservedSlug(slug)) {
    notFound();
  }

  const page = await loadCollectionPage(slug);
  if (!page) {
    notFound();
  }

  return <CollectionPageView page={page} />;
}
