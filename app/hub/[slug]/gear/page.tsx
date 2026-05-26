import { notFound } from "next/navigation";
import { GearPage } from "@/components/gear/GearPage";
import {
  isValidProfileSlug,
  normalizeProfileSlug,
} from "@/lib/auth/reserved-slugs";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = normalizeProfileSlug(raw);
  if (!isValidProfileSlug(slug)) return { title: "Not found" };
  return {
    title: `@${slug} · Setup · Kawaragi`,
    description: `The gear and setup behind @${slug}.`,
  };
}

export default async function PublicSlugGearPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = normalizeProfileSlug(raw);
  if (!isValidProfileSlug(slug)) notFound();

  return <GearPage slug={slug} />;
}
