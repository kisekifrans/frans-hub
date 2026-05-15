"use client";

import type { ProfileBlock } from "@/lib/types";
import { GifBlockCard } from "./GifBlockCard";
import { InstagramEmbed } from "./InstagramEmbed";
import { LinkBlockCard } from "./LinkBlockCard";
import { TikTokEmbed } from "./TikTokEmbed";

interface BlockRendererProps {
  block: ProfileBlock;
  onLinkClick?: (blockId: string) => void;
}

export function BlockRenderer({ block, onLinkClick }: BlockRendererProps) {
  if (!block.enabled) return null;

  switch (block.type) {
    case "link":
      return (
        <LinkBlockCard
          block={block}
          onClick={() => onLinkClick?.(block.id)}
        />
      );
    case "gif":
      return <GifBlockCard block={block} />;
    case "tiktok":
      return <TikTokEmbed url={block.url} />;
    case "instagram":
      return <InstagramEmbed url={block.url} />;
    default:
      return null;
  }
}
