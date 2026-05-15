"use client";

import { LazyMedia } from "@/components/collection/LazyMedia";
import type { CollectionGalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: CollectionGalleryImage[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  if (images.length === 0) return null;

  return (
    <div className={cn("collection-carousel -mx-1", className)}>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-none">
        {images.map((image) => (
          <article
            key={image.id}
            className="glass-card w-[72vw] max-w-[280px] shrink-0 snap-center overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20 sm:w-[240px]"
          >
            <LazyMedia
              src={image.url}
              alt={image.alt || "Gallery image"}
              aspectClassName="relative aspect-[4/5] w-full overflow-hidden"
              sizes="280px"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
