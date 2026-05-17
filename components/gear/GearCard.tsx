"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/GlassCard";
import { GearCardImage } from "@/components/gear/GearCardImage";
import { formatGearPrice } from "@/lib/gear/format";
import type { GearItem } from "@/lib/gear/types";
import { cn } from "@/lib/utils";

interface GearCardProps {
  item: GearItem;
  featured?: boolean;
  priority?: boolean;
}

export function GearCard({ item, featured, priority }: GearCardProps) {
  const t = useTranslations("gear");
  const priceLabel = formatGearPrice(item.price, item.priceCurrency);
  const hasLink = Boolean(item.productUrl?.trim());

  const inner = (
    <GlassCard
      padding="none"
      hover={hasLink}
      className={cn(
        "group signature-glow h-full overflow-hidden transition-shadow duration-300",
        hasLink && "hover:shadow-lg hover:shadow-violet-500/15",
        featured && "ring-1 ring-violet-400/25",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          featured ? "aspect-[16/10]" : "aspect-[4/3]",
        )}
      >
        <GearCardImage
          mediaKey={item.id}
          src={item.imageUrl}
          alt={item.name}
          focus={item.imageFocus}
          priority={priority}
        />
        {item.featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-violet-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {t("featuredBadge")}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-semibold text-zinc-900 dark:text-white",
              featured ? "text-lg" : "text-sm",
            )}
          >
            {item.name}
          </h3>
          {hasLink ? (
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition group-hover:text-violet-500" />
          ) : null}
        </div>
        {item.description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {item.description}
          </p>
        ) : null}
        {priceLabel ? (
          <p className="mt-2 text-sm font-medium text-violet-700 dark:text-violet-300">
            {priceLabel}
          </p>
        ) : null}
      </div>
    </GlassCard>
  );

  if (hasLink) {
    return (
      <a
        href={item.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 rounded-2xl"
      >
        {inner}
      </a>
    );
  }

  return <div className="h-full">{inner}</div>;
}
