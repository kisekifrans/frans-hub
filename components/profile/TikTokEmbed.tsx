"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LazyEmbed } from "@/components/profile/LazyEmbed";

interface TikTokEmbedProps {
  url: string;
}

export function TikTokEmbed({ url }: TikTokEmbedProps) {
  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://www.tiktok.com/embed.js"]',
    );
    if (existing) {
      (
        window as unknown as {
          tiktokEmbed?: { lib: { render: () => void } };
        }
      ).tiktokEmbed?.lib?.render?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [url]);

  return (
    <LazyEmbed className="w-full">
      <GlassCard padding="sm" className="overflow-hidden">
        <div className="flex w-full justify-center overflow-x-auto">
          <blockquote
            className="tiktok-embed mx-auto max-w-full"
            cite={url}
            data-video-id={extractTikTokId(url)}
            style={{
              maxWidth: "min(100%, 325px)",
              minWidth: "min(280px, 100%)",
            }}
          >
            <section>
              <a href={url} target="_blank" rel="noopener noreferrer">
                View on TikTok
              </a>
            </section>
          </blockquote>
        </div>
      </GlassCard>
    </LazyEmbed>
  );
}

function extractTikTokId(url: string): string {
  const match = url.match(/video\/(\d+)/);
  return match?.[1] ?? "";
}
