import { SignaturePageClient } from "@/components/signature/SignaturePageClient";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildLocalizedMetadata(locale as AppLocale, "signature");
}

export default function SignaturePage() {
  return <SignaturePageClient />;
}
