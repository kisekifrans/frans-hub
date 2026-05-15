"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MotionDiv } from "@/components/ui/motion";
import { SafeImage } from "@/components/ui/SafeImage";
import type { GifBlock } from "@/lib/types";
import { isValidImageSrc } from "@/lib/image-utils";

export function GifBlockCard({ block }: { block: GifBlock }) {
  if (!isValidImageSrc(block.url)) {
    return (
      <MotionDiv whileHover={{ scale: 1.01 }}>
        <GlassCard padding="md" className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          Media coming soon
        </GlassCard>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv whileHover={{ scale: 1.01 }}>
      <GlassCard padding="none" className="overflow-hidden">
        <div className="relative aspect-video w-full">
          <SafeImage
            src={block.url}
            alt={block.alt ?? "GIF"}
            fill
            className="object-cover transition duration-500 hover:scale-[1.02]"
            sizes="(max-width: 480px) 100vw, 420px"
          />
        </div>
        {block.caption && (
          <p className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-300">
            {block.caption}
          </p>
        )}
      </GlassCard>
    </MotionDiv>
  );
}
