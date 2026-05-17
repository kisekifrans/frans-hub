"use client";

import { MediaPreview } from "@/components/ui/MediaPreview";
import { thumbnailFocusStyle } from "@/lib/thumbnail-focus";
import type { ThumbnailFocus } from "@/lib/thumbnail-focus";
import { isValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

function GearImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10",
        className,
      )}
    >
      <span className="text-3xl opacity-40">⚙️</span>
    </div>
  );
}

interface GearCardImageProps {
  mediaKey: string;
  src?: string;
  alt: string;
  focus?: ThumbnailFocus | null;
  priority?: boolean;
  className?: string;
}

export function GearCardImage({
  mediaKey,
  src,
  alt,
  focus,
  priority,
  className,
}: GearCardImageProps) {
  const valid = isValidImageSrc(src);
  const style = thumbnailFocusStyle(focus);

  if (!valid) {
    return <GearImagePlaceholder className={className} />;
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <MediaPreview
        mediaKey={mediaKey}
        keyPrefix="gear-card"
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        style={style}
      />
    </div>
  );
}
