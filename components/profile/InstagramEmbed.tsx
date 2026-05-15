"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LazyEmbed } from "@/components/profile/LazyEmbed";

interface InstagramEmbedProps {
  url: string;
}

export function InstagramEmbed({ url }: InstagramEmbedProps) {
  useEffect(() => {
    const existing = document.querySelector(
      'script[src="//www.instagram.com/embed.js"]',
    );
    if (existing) {
      (
        window as unknown as {
          instgrm?: { Embeds: { process: () => void } };
        }
      ).instgrm?.Embeds?.process?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [url]);

  return (
    <LazyEmbed className="w-full">
      <GlassCard padding="sm" className="overflow-hidden">
        <div className="flex w-full justify-center">
          <blockquote
            className="instagram-media !max-w-full"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{
              background: "transparent",
              border: 0,
              borderRadius: 12,
              margin: 0,
              maxWidth: "min(100%, 540px)",
              minWidth: "min(280px, 100%)",
              width: "100%",
            }}
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              View on Instagram
            </a>
          </blockquote>
        </div>
      </GlassCard>
    </LazyEmbed>
  );
}
