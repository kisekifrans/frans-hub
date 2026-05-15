"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LazyMedia } from "@/components/collection/LazyMedia";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CollectionProduct } from "@/lib/types";
import { isValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: CollectionProduct;
  index: number;
  onCtaClick?: () => void;
}

export function ProductCard({ product, index, onCtaClick }: ProductCardProps) {
  const mediaSrc = isValidImageSrc(product.gifUrl)
    ? product.gifUrl
    : product.imageUrl;
  const isGif = Boolean(product.gifUrl && isValidImageSrc(product.gifUrl));

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <GlassCard
        padding="none"
        hover
        className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/15"
      >
        <div className="relative">
          <LazyMedia
            src={mediaSrc}
            alt={product.title}
            asGif={isGif}
            aspectClassName="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5]"
            sizes="(max-width: 640px) 100vw, 480px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:hidden">
            <p className="text-lg font-semibold text-white drop-shadow-sm">
              {product.title}
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              {product.title}
            </h3>
            {product.description && (
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {product.description}
              </p>
            )}
          </div>

          {product.reviewText && (
            <p className="text-xs italic leading-relaxed text-violet-700/90 dark:text-violet-200/90">
              &ldquo;{product.reviewText}&rdquo;
            </p>
          )}

          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={onCtaClick}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold",
              "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25",
              "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/35",
            )}
          >
            {product.ctaLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </GlassCard>
    </motion.article>
  );
}
