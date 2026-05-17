import type { NextConfig } from "next";

type RemotePattern = {
  protocol: "https" | "http";
  hostname: string;
  pathname?: string;
};

function supabaseImagePatterns(): RemotePattern[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.giphy.com" },
      { protocol: "https", hostname: "**.giphy.com" },
      ...supabaseImagePatterns(),
    ],
  },
};

export default nextConfig;
