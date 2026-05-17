"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { isGifMediaUrl, mediaReactKey } from "@/lib/media-url";

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("/storage/v1/object/public/");
}
import { isValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

type MediaPreviewProps = {
  src: string | null | undefined;
  alt: string;
  /** Stable entity id (gear item id, block id) — required for React keys */
  mediaKey: string;
  keyPrefix?: string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  /** Use native img (e.g. blob preview while uploading a GIF) */
  preferNativeImg?: boolean;
} & Pick<ImageProps, "unoptimized">;

/**
 * Renders static images via next/image; animated GIFs via native img (reliable loop).
 */
export function MediaPreview({
  src,
  alt,
  mediaKey,
  keyPrefix = "media",
  fill,
  className,
  style,
  sizes,
  priority,
  loading = "lazy",
  preferNativeImg = false,
}: MediaPreviewProps) {
  const [useNativeFallback, setUseNativeFallback] = useState(false);
  const [errored, setErrored] = useState(false);
  const valid = isValidImageSrc(src) && !errored;

  if (!valid) return null;

  const url = src!.trim();
  const reactKey = mediaReactKey(keyPrefix, mediaKey, url);
  const useNative =
    preferNativeImg ||
    isGifMediaUrl(url) ||
    isSupabaseStorageUrl(url) ||
    useNativeFallback;

  if (useNative) {
    if (fill) {
      return (
        <img
          key={reactKey}
          src={url}
          alt={alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            className,
          )}
          style={style}
          loading={priority ? "eager" : loading}
          decoding="async"
          onError={() => setErrored(true)}
        />
      );
    }
    return (
      <img
        key={reactKey}
        src={url}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? "eager" : loading}
        decoding="async"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <Image
      key={reactKey}
      src={url}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      unoptimized
      onError={() => {
        if (!useNativeFallback) {
          setUseNativeFallback(true);
          return;
        }
        setErrored(true);
      }}
    />
  );
}
