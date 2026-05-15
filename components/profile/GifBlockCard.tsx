"use client";

import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { MotionDiv } from "@/components/ui/motion";
import type { GifBlock } from "@/lib/types";

export function GifBlockCard({ block }: { block: GifBlock }) {
  if (!block.url) return null;

  return (
    <MotionDiv whileHover={{ scale: 1.01 }}>
      <GlassCard padding="none" className="overflow-hidden">
        <div className="relative aspect-video w-full">
          <Image
            src={block.url}
            alt={block.alt ?? "GIF"}
            fill
            className="object-cover transition duration-500 hover:scale-[1.02]"
            unoptimized
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
