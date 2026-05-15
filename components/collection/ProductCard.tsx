"use client";

import { motion } from "framer-motion";
import { LazyMedia } from "@/components/collection/LazyMedia";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CollectionProduct } from "@/lib/types";
import { isValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: CollectionProduct;
  index: number;
  onClick?: () => void;
}

export function ProductCard({ product, index, onClick }: ProductCardProps) {
  const mediaSrc = isValidImageSrc(product.gifUrl)
    ? product.gifUrl
    : product.imageUrl;
  const isGif = Boolean(product.gifUrl && isValidImageSrc(product.gifUrl));
  const caption = product.description?.trim();

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="list-none"
    >
      <a
        href={product.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={onClick}
        className="group block no-underline"
        aria-label={product.title}
      >
        <GlassCard
          padding="none"
          hover
          className={cn(
            "overflow-hidden transition-all duration-300",
            "hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/25",
          )}
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <LazyMedia
              src={mediaSrc}
              alt={product.title}
              asGif={isGif}
              aspectClassName="relative h-full w-full overflow-hidden"
              sizes="(max-width: 480px) 50vw, 220px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
              <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow-md">
                {product.title}
              </p>
              {caption ? (
                <p className="mt-0.5 line-clamp-1 text-[11px] text-white/85">
                  {caption}
                </p>
              ) : null}
            </div>
          </div>
        </GlassCard>
      </a>
    </motion.li>
  );
}
