"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { CreatorReview } from "@/components/collection/CreatorReview";
import { GifPreview } from "@/components/collection/GifPreview";
import { ImageCarousel } from "@/components/collection/ImageCarousel";
import { ProductCard } from "@/components/collection/ProductCard";
import { RevealSection } from "@/components/collection/RevealSection";
import { PageShell } from "@/components/ui/PageShell";
import { trackCollectionEvent } from "@/lib/analytics-client";
import type { CollectionPageData } from "@/lib/types";

interface CollectionPageViewProps {
  page: CollectionPageData;
}

export function CollectionPageView({ page }: CollectionPageViewProps) {
  const { collection, profileId, theme, creatorName } = page;
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current || profileId === "catalog") return;
    viewedRef.current = true;
    void trackCollectionEvent({
      profileId,
      eventType: "view",
      collectionId: collection.id,
    });
  }, [profileId, collection.id]);

  const trackProductClick = (productId: string) => {
    if (profileId === "catalog") return;
    void trackCollectionEvent({
      profileId,
      eventType: "click",
      collectionId: collection.id,
      productId,
    });
  };

  return (
    <PageShell variant={theme}>
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-14 pt-6 sm:px-6 sm:pt-8">
        <nav className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 dark:hover:bg-white/15"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to hub
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Storefront
          </span>
        </nav>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            {creatorName} presents
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {collection.description}
            </p>
          )}
        </motion.header>

        {collection.heroGifUrl && (
          <RevealSection className="mb-8">
            <GifPreview src={collection.heroGifUrl} alt={`${collection.title} preview`} />
          </RevealSection>
        )}

        {collection.gallery.length > 0 && (
          <RevealSection className="mb-10" delay={0.05}>
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Lookbook
            </h2>
            <ImageCarousel images={collection.gallery} />
          </RevealSection>
        )}

        {collection.reviewText && (
          <RevealSection className="mb-10" delay={0.08}>
            <CreatorReview text={collection.reviewText} creatorName={creatorName} />
          </RevealSection>
        )}

        {collection.products.length > 0 && (
          <section className="space-y-6">
            <RevealSection delay={0.1}>
              <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Picks
              </h2>
              <p className="px-1 text-sm text-zinc-600 dark:text-zinc-300">
                Curated affiliate favorites — tap to shop.
              </p>
            </RevealSection>

            <div className="flex flex-col gap-6">
              {collection.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onCtaClick={() => trackProductClick(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Affiliate links may earn commission · {creatorName}
        </footer>
      </div>
    </PageShell>
  );
}
