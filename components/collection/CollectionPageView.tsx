"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
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
  const heroSrc = collection.heroGifUrl ?? collection.heroImageUrl;

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
        <nav className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 dark:hover:bg-white/15"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {creatorName}
          </span>
        </nav>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {collection.title}
          </h1>
          {collection.description ? (
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {collection.description}
            </p>
          ) : null}
        </motion.header>

        {heroSrc ? (
          <RevealSection className="mb-5">
            <GifPreview src={heroSrc} alt={collection.title} />
          </RevealSection>
        ) : null}

        {collection.gallery.length > 0 ? (
          <RevealSection className="mb-6" delay={0.04}>
            <ImageCarousel images={collection.gallery} />
          </RevealSection>
        ) : null}

        {collection.products.length > 0 ? (
          <section>
            <RevealSection delay={0.06}>
              <p className="mb-3 px-0.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Curated picks
              </p>
            </RevealSection>
            <ul className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {collection.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onClick={() => trackProductClick(product.id)}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="mt-10 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
          Affiliate links · {creatorName}
        </footer>
      </div>
    </PageShell>
  );
}
