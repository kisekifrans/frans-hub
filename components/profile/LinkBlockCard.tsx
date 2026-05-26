"use client";

import { Copy, ExternalLink, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { MotionDiv } from "@/components/ui/motion";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { thumbnailFocusStyle } from "@/lib/thumbnail-focus";
import { openLinkUrl } from "@/lib/thumbnail-crop";
import type { LinkBlock } from "@/lib/types";
import { isValidImageSrc } from "@/lib/image-utils";
import { validateBlockUrl } from "@/lib/security/block-url";
import { cn } from "@/lib/utils";

interface LinkBlockCardProps {
  block: LinkBlock;
  featured?: boolean;
  onClick?: () => void;
}

export function LinkBlockCard({ block, featured, onClick }: LinkBlockCardProps) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);
  const hasThumbnail = isValidImageSrc(block.thumbnailUrl);
  const layout = block.thumbnailLayout ?? "side";
  const isBanner = hasThumbnail && layout === "banner";
  const thumbStyle = thumbnailFocusStyle(block.thumbnailFocus);
  const validated = validateBlockUrl("link", block.url);
  const safeUrl = validated.ok ? validated.url : "";
  const hasUrl = Boolean(safeUrl);

  const openBlockLink = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!hasUrl) return;
      onClick?.();
      openLinkUrl(safeUrl);
    },
    [safeUrl, hasUrl, onClick],
  );

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasUrl) return;
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <MotionDiv whileHover={{ scale: featured ? 1.02 : 1.012 }} whileTap={{ scale: 0.985 }}>
      <GlassCard
        hover
        padding="none"
        className={cn(
          "group w-full overflow-hidden transition-shadow duration-300",
          "hover:shadow-lg hover:shadow-violet-500/10 dark:hover:shadow-violet-900/20",
          featured &&
            "ring-1 ring-violet-400/35 shadow-md shadow-violet-500/10 dark:ring-violet-400/25",
          hasUrl && "cursor-pointer",
        )}
      >
        <div className={cn(isBanner ? "" : "px-4 pt-3.5 pb-2")}>
          <div
            role="link"
            tabIndex={hasUrl ? 0 : -1}
            aria-label={block.title}
            onClick={openBlockLink}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                openBlockLink(e);
              }
            }}
            className="block outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl"
          >
            {isBanner && hasThumbnail && (
              <div className="relative mb-0 aspect-[2/1] w-full overflow-hidden">
                <MediaPreview
                  mediaKey={block.id}
                  keyPrefix="link-banner"
                  src={block.thumbnailUrl}
                  alt=""
                  fill
                  className="pointer-events-none object-cover transition duration-500 group-hover:scale-[1.03]"
                  style={thumbStyle}
                  sizes="(max-width: 480px) 100vw, 420px"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
            )}

            <div
              className={cn(
                "flex items-center justify-between gap-3",
                isBanner && "px-4 py-3",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {hasThumbnail && layout === "side" && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-white/30 dark:ring-white/10">
                    <MediaPreview
                      mediaKey={block.id}
                      keyPrefix="link-side"
                      src={block.thumbnailUrl}
                      alt=""
                      fill
                      className="pointer-events-none object-cover"
                      style={thumbStyle}
                      sizes="96px"
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
              <div className="flex shrink-0 items-center gap-1.5">
                {hasUrl && (
                  <span className="hidden text-[11px] font-medium text-violet-600 opacity-0 transition group-hover:opacity-100 sm:inline dark:text-violet-400">
                    {t("linkOpen")}
                  </span>
                )}
                <ExternalLink
                  className={cn(
                    "pointer-events-none h-4 w-4 shrink-0 text-zinc-400 transition",
                    hasUrl &&
                      "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-500 dark:group-hover:text-violet-400",
                  )}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "relative z-10 flex justify-end",
              isBanner ? "px-4 pb-2.5 pt-0" : "mt-0.5",
            )}
          >
            <button
              type="button"
              onClick={copyLink}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-zinc-500 transition hover:bg-white/30 hover:text-violet-600 dark:hover:text-violet-300"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {t("copyLinkBlock")}
            </button>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
}
