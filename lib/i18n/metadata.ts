import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://agisna.dev";

type PageKey = "home" | "gear" | "academicaudit" | "signature" | "typing" | "typingmonster";

const pathByPage: Record<PageKey, string> = {
  home: "",
  gear: "/gear",
  academicaudit: "/tools/academicaudit",
  signature: "/signature",
  typing: "/typing",
  typingmonster: "/typingmonster",
};

export async function buildLocalizedMetadata(
  locale: AppLocale,
  page: PageKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `metadata.${page}` });

  const segment = pathByPage[page];
  const canonical = `${siteUrl}/${locale}${segment}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${siteUrl}/${l}${segment}`;
  }

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      locale: locale === "zh" ? "zh_CN" : locale === "id" ? "id_ID" : "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === "zh" ? "zh_CN" : l === "id" ? "id_ID" : "en_US")),
    },
  };
}
