"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FeaturedGearSection } from "@/components/gear/FeaturedGearSection";
import { GearCategorySection } from "@/components/gear/GearCategorySection";
import { GearHero } from "@/components/gear/GearHero";
import { PageShell } from "@/components/ui/PageShell";
import { usePublicGear } from "@/hooks/usePublicGear";
import {
  featuredGearItems,
  groupGearByCategory,
} from "@/lib/gear/group";

export function GearPage() {
  const t = useTranslations("gear");
  const { data, profileId, loading, error } = usePublicGear();

  if (loading) {
    return (
      <PageShell variant="violet" contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell variant="violet" contentClassName="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {error ?? t("unavailable")}{" "}
          <code className="rounded bg-white/20 px-1">{t("migrationHint")}</code>
        </p>
      </PageShell>
    );
  }

  const featured = featuredGearItems(data.items);
  const featuredIds = new Set(featured.map((i) => i.id));
  const rest = data.items.filter((i) => !featuredIds.has(i.id));
  const groups = groupGearByCategory(data.categories, rest, {
    hideEmpty: true,
  });

  return (
    <PageShell variant={data.profile.theme}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <GearHero
          profile={data.profile}
          profileId={profileId ?? undefined}
          setupDescription={data.settings.setupDescription}
        />

        <FeaturedGearSection items={featured} />

        {groups.length > 0 ? (
          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
              {t("allGear")}
            </h2>
            {groups.map((group, i) => (
              <GearCategorySection
                key={group.category.id}
                group={group}
                defaultOpen={i < 4}
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-violet-300/30 py-16 text-center text-sm text-zinc-500">
            {t("empty")}
          </p>
        ) : null}

        <footer className="mt-12 pb-6 text-center text-xs text-zinc-500">
          <Link href="/gear" className="text-violet-600 hover:underline dark:text-violet-300">
            {t("footerPath")}
          </Link>
        </footer>
      </div>
    </PageShell>
  );
}
