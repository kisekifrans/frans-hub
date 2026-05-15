"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isValidImageSrc, initialsFromName } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  fallbackName?: string;
}

export function AvatarFallback({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-violet-600/30 text-sm font-semibold text-violet-700 dark:text-violet-200",
        className,
      )}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  );
}

export function SafeImage({
  src,
  alt,
  fallback,
  fallbackName,
  className,
  fill,
  ...props
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  const valid = isValidImageSrc(src) && !errored;

  if (!valid) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (fallbackName) {
      return <AvatarFallback name={fallbackName} className={className as string} />;
    }
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-white/20 text-zinc-400 dark:bg-white/10",
          fill ? "absolute inset-0" : "",
          className,
        )}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={src!.trim()}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
