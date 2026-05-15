import type { Collection, CollectionPageData } from "@/lib/types";

const IMG = {
  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  boxing:
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
  essentials:
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  tee1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  tee2: "https://images.unsplash.com/photo-1503342394121-0cc4fcca0b22?w=600&q=80",
  gloves:
    "https://images.unsplash.com/photo-1599054963802-47d4277c5645?w=600&q=80",
  bottle:
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
  skincare:
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
};

const GIF = {
  excited:
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  fashion:
    "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif",
  workout:
    "https://media.giphy.com/media/3o6Zt4HU9QqO8X8X0Y/giphy.gif",
};

function page(
  collection: Collection,
  extras?: Partial<Pick<CollectionPageData, "profileId" | "theme" | "creatorName">>,
): CollectionPageData {
  return {
    collection,
    profileId: extras?.profileId ?? "catalog",
    theme: extras?.theme ?? "violet",
    creatorName: extras?.creatorName ?? "Frans Hub",
  };
}

const tshirtfrans: Collection = {
  id: "col-tshirtfrans",
  slug: "tshirtfrans",
  title: "T-Shirt Frans",
  description:
    "Curated tees and streetwear drops I actually wear — limited runs, honest picks, affiliate-supported.",
  heroGifUrl: GIF.fashion,
  reviewText:
    "These are the fits I reach for on camera: soft cotton, clean prints, and colors that hold up after dozens of washes. Every piece here earned a spot in my rotation.",
  seoTitle: "T-Shirt Frans — Creator Streetwear Picks",
  seoDescription:
    "Shop Frans' hand-picked tees and streetwear. Editorial lookbook, GIF previews, and affiliate links.",
  gradientPreset: "violet",
  layoutStyle: "editorial",
  enabled: true,
  order: 0,
  gallery: [
    { id: "g1", url: IMG.fashion, alt: "Streetwear flat lay", order: 0 },
    { id: "g2", url: IMG.tee1, alt: "Oversized tee", order: 1 },
    { id: "g3", url: IMG.tee2, alt: "Graphic tee detail", order: 2 },
  ],
  products: [
    {
      id: "p1",
      title: "Signature Oversized Tee",
      description: "Heavyweight cotton, relaxed drop-shoulder cut.",
      imageUrl: IMG.tee1,
      gifUrl: GIF.fashion,
      affiliateUrl: "https://example.com/tee-oversized",
      ctaLabel: "Shop tee",
      reviewText: "My daily uniform — pairs with everything.",
      tags: ["streetwear", "tee"],
      order: 0,
      enabled: true,
    },
    {
      id: "p2",
      title: "Vintage Wash Graphic",
      description: "Faded wash, limited colorways.",
      imageUrl: IMG.tee2,
      affiliateUrl: "https://example.com/tee-graphic",
      ctaLabel: "Get the drop",
      tags: ["graphic"],
      order: 1,
      enabled: true,
    },
  ],
};

const boxinggear: Collection = {
  id: "col-boxinggear",
  slug: "boxinggear",
  title: "Boxing Gear",
  description:
    "Gloves, wraps, and training essentials tested in real sessions — built for power, comfort, and longevity.",
  heroGifUrl: GIF.workout,
  reviewText:
    "I train five days a week. This gear survived heavy bag rounds, sparring, and travel — no fluff, just equipment I trust.",
  seoTitle: "Boxing Gear — Training Essentials by Frans",
  seoDescription:
    "Creator-tested boxing gloves and training gear. Lookbook gallery and shop links.",
  gradientPreset: "fuchsia",
  layoutStyle: "editorial",
  enabled: true,
  order: 1,
  gallery: [
    { id: "g1", url: IMG.boxing, alt: "Boxing gym atmosphere", order: 0 },
    { id: "g2", url: IMG.gloves, alt: "Boxing gloves close-up", order: 1 },
  ],
  products: [
    {
      id: "p1",
      title: "Pro Training Gloves",
      description: "12oz — wrist support for bag and mitt work.",
      imageUrl: IMG.gloves,
      gifUrl: GIF.workout,
      affiliateUrl: "https://example.com/boxing-gloves",
      ctaLabel: "Shop gloves",
      reviewText: "Best wrist lock I've used under $150.",
      tags: ["boxing", "gloves"],
      order: 0,
      enabled: true,
    },
    {
      id: "p2",
      title: "Hand Wraps Bundle",
      description: "180\" elastic wraps, 3-pack.",
      imageUrl: IMG.boxing,
      affiliateUrl: "https://example.com/hand-wraps",
      ctaLabel: "Add to bag",
      tags: ["training"],
      order: 1,
      enabled: true,
    },
  ],
};

const dailyessentials: Collection = {
  id: "col-dailyessentials",
  slug: "dailyessentials",
  title: "Daily Essentials",
  description:
    "Skincare, hydration, and everyday carry — the quiet staples behind every shoot day.",
  heroGifUrl: GIF.excited,
  reviewText:
    "Glow without the 12-step ritual. These are the products that keep me camera-ready without feeling overdone.",
  seoTitle: "Daily Essentials — Skincare & Lifestyle Picks",
  seoDescription:
    "Frans' daily essentials: skincare, hydration, and lifestyle affiliate picks.",
  gradientPreset: "rose",
  layoutStyle: "editorial",
  enabled: true,
  order: 2,
  gallery: [
    { id: "g1", url: IMG.essentials, alt: "Vanity essentials", order: 0 },
    { id: "g2", url: IMG.skincare, alt: "Skincare lineup", order: 1 },
    { id: "g3", url: IMG.bottle, alt: "Hydration bottle", order: 2 },
  ],
  products: [
    {
      id: "p1",
      title: "AM Glow Serum",
      description: "Vitamin C + lightweight finish under SPF.",
      imageUrl: IMG.skincare,
      affiliateUrl: "https://example.com/glow-serum",
      ctaLabel: "Shop serum",
      reviewText: "Visible brightness by week two.",
      tags: ["skincare", "beauty"],
      order: 0,
      enabled: true,
    },
    {
      id: "p2",
      title: "Insulated Daily Bottle",
      description: "24h cold, matte finish, travel-friendly.",
      imageUrl: IMG.bottle,
      gifUrl: GIF.excited,
      affiliateUrl: "https://example.com/water-bottle",
      ctaLabel: "Grab bottle",
      tags: ["hydration", "lifestyle"],
      order: 1,
      enabled: true,
    },
  ],
};

export const COLLECTION_CATALOG: Record<string, CollectionPageData> = {
  tshirtfrans: page(tshirtfrans),
  boxinggear: page(boxinggear),
  dailyessentials: page(dailyessentials),
};

export const COLLECTION_SLUGS = Object.keys(COLLECTION_CATALOG);

export function getCatalogCollection(slug: string): CollectionPageData | null {
  return COLLECTION_CATALOG[slug.toLowerCase()] ?? null;
}
