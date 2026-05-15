"use client";

import Image from "next/image";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { MotionDiv } from "@/components/ui/motion";
import type { LinkBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LinkBlockCardProps {
  block: LinkBlock;
  onClick?: () => void;
}

export function LinkBlockCard({ block, onClick }: LinkBlockCardProps) {
  const [copied, setCopied] = useState(false);
  const hasThumbnail = Boolean(block.thumbnailUrl?.trim());
  const layout = block.thumbnailLayout ?? "side";
  const isBanner = hasThumbnail && layout === "banner";

  const copyAffiliate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(block.url);
      setCopied(true);
      toast.success("Affiliate link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <MotionDiv whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <GlassCard
        hover
        padding={isBanner ? "none" : "md"}
        className="group w-full overflow-hidden"
      >
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="block no-underline"
        >
          {isBanner && block.thumbnailUrl && (
            <div className="relative aspect-[2/1] w-full overflow-hidden">
              <Image
                src={block.thumbnailUrl}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 480px) 100vw, 420px"
                unoptimized
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
              {hasThumbnail && layout === "side" && block.thumbnailUrl && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-white/30 dark:ring-white/10">
                  <Image
                    src={block.thumbnailUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
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
            <ExternalLink className="h-4 w-4 shrink-0 text-zinc-400 transition group-hover:text-violet-500" />
          </div>
        </a>
        <div className="flex justify-end border-t border-white/10 px-3 py-2">
          <button
            type="button"
            onClick={copyAffiliate}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-white/30 hover:text-violet-600 dark:hover:text-violet-300"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copy affiliate link
          </button>
        </div>
      </GlassCard>
    </MotionDiv>
  );
}
