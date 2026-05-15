"use client";

import { LazyMedia } from "@/components/collection/LazyMedia";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface GifPreviewProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function GifPreview({ src, alt = "Collection preview", className }: GifPreviewProps) {
  if (!src) return null;

  return (
    <GlassCard padding="none" className={cn("overflow-hidden", className)}>
      <LazyMedia
        src={src}
        alt={alt}
        asGif
        aspectClassName="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1]"
        sizes="(max-width: 640px) 100vw, 560px"
      />
    </GlassCard>
  );
}
