import { emptyAnalytics } from "@/lib/analytics-report";
import type { AppData } from "./types";

export const EMPTY_ANALYTICS = emptyAnalytics("30d", "daily");

export const DEFAULT_DATA: AppData = {
  profile: {
    username: "frans",
    displayName: "Frans Hub",
    bio: "Creator · Deals · Exclusive links below",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    verified: true,
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com" },
      { platform: "tiktok", url: "https://tiktok.com" },
    ],
    theme: "violet",
    blocks: [
      {
        id: "link-1",
        type: "link",
        enabled: true,
        order: 0,
        title: "Shop my favorites",
        url: "https://example.com/shop",
        accent: "#a78bfa",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
        thumbnailLayout: "side",
      },
      {
        id: "link-2",
        type: "link",
        enabled: true,
        order: 1,
        title: "20% off — use code FRANS",
        url: "https://example.com/deal",
        accent: "#22d3ee",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=450&fit=crop",
        thumbnailLayout: "banner",
      },
      {
        id: "gif-1",
        type: "gif",
        enabled: true,
        order: 2,
        url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
        alt: "Excited reaction",
        caption: "New drop this week",
      },
      {
        id: "tiktok-1",
        type: "tiktok",
        enabled: true,
        order: 3,
        url: "https://www.tiktok.com/@scout2015/video/6718339390844675174",
      },
      {
        id: "ig-1",
        type: "instagram",
        enabled: true,
        order: 4,
        url: "https://www.instagram.com/p/CUbHfhpswxt/",
      },
      {
        id: "link-3",
        type: "link",
        enabled: true,
        order: 5,
        title: "Newsletter",
        url: "https://example.com/newsletter",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=200&h=200&fit=crop",
        thumbnailLayout: "side",
      },
    ],
  },
  analytics: EMPTY_ANALYTICS,
};
