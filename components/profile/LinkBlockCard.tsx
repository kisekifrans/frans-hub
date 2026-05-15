"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MotionDiv } from "@/components/ui/motion";
import { SafeImage } from "@/components/ui/SafeImage";
import type { LinkBlock } from "@/lib/types";
import { isValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface LinkBlockCardProps {
  block: LinkBlock;
  onClick?: () => void;
}

function isInternalHref(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

function LinkCardInner({
  block,
  hasThumbnail,
  layout,
  isBanner,
  showExternalIcon,
}: {
  block: LinkBlock;
  hasThumbnail: boolean;
  layout: "side" | "banner";
  isBanner: boolean;
  showExternalIcon: boolean;
}) {
  return (
    <>
      {isBanner && hasThumbnail && (
        <div className="relative aspect-[2/1] w-full overflow-hidden">
          <SafeImage
            src={block.thumbnailUrl}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 480px) 100vw, 420px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-between gap-3",
          isBanner && "px-4 py-3.5",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {hasThumbnail && layout === "side" && (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-white/30 dark:ring-white/10">
              <SafeImage
                src={block.thumbnailUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}
          {!hasThumbnail && block.accent && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: block.accent }}
            />
          )}
          <span className="truncate font-semibold text-zinc-900 dark:text-white">
            {block.title}
          </span>
        </div>
        {showExternalIcon && (
          <ExternalLink className="h-4 w-4 shrink-0 text-zinc-400 transition group-hover:text-violet-500" />
        )}
      </div>
    </>
  );
}

export function LinkBlockCard({ block, onClick }: LinkBlockCardProps) {
  const hasThumbnail = isValidImageSrc(block.thumbnailUrl);
  const layout = block.thumbnailLayout ?? "side";
  const isBanner = hasThumbnail && layout === "banner";
  const internal = isInternalHref(block.url);
  const showExternalIcon = !internal;

  const card = (
    <GlassCard
      hover
      padding={isBanner ? "none" : "md"}
      className="group block w-full overflow-hidden no-underline"
    >
      <LinkCardInner
        block={block}
        hasThumbnail={hasThumbnail}
        layout={layout}
        isBanner={isBanner}
        showExternalIcon={showExternalIcon}
      />
    </GlassCard>
  );

  return (
    <MotionDiv whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.99 }}>
      {internal ? (
        <Link href={block.url} onClick={onClick} className="block">
          {card}
        </Link>
      ) : (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="block no-underline"
        >
          {card}
        </a>
      )}
    </MotionDiv>
  );
}
