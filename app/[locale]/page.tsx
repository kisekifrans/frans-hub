import { PublicProfile } from "@/components/profile/PublicProfile";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildLocalizedMetadata(locale as AppLocale, "home");
}

export default function HomePage() {
  return <PublicProfile />;
}
