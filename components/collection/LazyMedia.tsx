"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { isValidImageSrc } from "@/lib/image-utils";

interface LazyMediaProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Use native img for GIFs (better animation + lazy load) */
  asGif?: boolean;
  priority?: boolean;
  sizes?: string;
  aspectClassName?: string;
}

export function LazyMedia({
  src,
  alt,
  className,
  asGif = false,
  priority = false,
  sizes = "100vw",
  aspectClassName = "relative aspect-[4/5] w-full overflow-hidden",
}: LazyMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const valid = isValidImageSrc(src);

  if (!valid) {
    return (
      <div
        className={cn(
          aspectClassName,
          "bg-white/15 dark:bg-white/5",
          className,
        )}
        aria-hidden
      />
    );
  }

  const url = src!.trim();

  if (asGif || /\.gif(\?|$)/i.test(url)) {
    return (
      <div className={cn(aspectClassName, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-white/20 dark:bg-white/10" />
        )}
      </div>
    );
  }

  return (
    <div className={cn(aspectClassName, className)}>
      <Image
        src={url}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
        sizes={sizes}
        unoptimized
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-white/20 dark:bg-white/10" />
      )}
    </div>
  );
}
