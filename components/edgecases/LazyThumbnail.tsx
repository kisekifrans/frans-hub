"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

function LazyThumbnailInner({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-200/50 dark:bg-white/5",
        className,
      )}
    >
      {!src || failed ? (
        <div className="flex aspect-video w-full items-center justify-center text-zinc-400">
          <Film className="h-8 w-8 opacity-50" />
        </div>
      ) : (
        <>
          {visible && !loaded && (
            <div className="absolute inset-0 animate-pulse bg-white/30 dark:bg-white/10" />
          )}
          {visible ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={cn(
                "aspect-video w-full object-cover transition-opacity duration-300",
                loaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="aspect-video w-full animate-pulse bg-white/20" />
          )}
        </>
      )}
    </div>
  );
}

export const LazyThumbnail = memo(LazyThumbnailInner);
