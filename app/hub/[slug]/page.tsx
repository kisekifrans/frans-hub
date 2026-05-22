import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/profile/PublicProfile";
import { isValidProfileSlug, normalizeProfileSlug } from "@/lib/auth/reserved-slugs";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = normalizeProfileSlug(raw);
  if (!isValidProfileSlug(slug)) return { title: "Not found" };
  return {
    title: `@${slug} · Kawaragi`,
    description: `Public link hub for ${slug}`,
  };
}

export default async function PublicSlugPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = normalizeProfileSlug(raw);
  if (!isValidProfileSlug(slug)) notFound();

  return <PublicProfile slug={slug} minimalNav />;
}
