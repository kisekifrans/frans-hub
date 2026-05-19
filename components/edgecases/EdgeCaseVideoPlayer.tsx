"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const POSITION_KEY = (id: string) => `edgecase-playback-${id}`;

interface EdgeCaseVideoPlayerProps {
  edgeCaseId: string;
  videoUrl: string;
  mimeType?: string;
  playSession?: number;
  onPlaybackError?: (message: string) => void;
}

/** Native HTML5 player — not memoized so src changes always remount. */
export function EdgeCaseVideoPlayer({
  edgeCaseId,
  videoUrl,
  mimeType = "video/mp4",
  playSession = 0,
  onPlaybackError,
}: EdgeCaseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    setBuffering(true);
    const el = videoRef.current;
    if (!el || !videoUrl.trim()) return;

    console.log("[edgecase] assign src", videoUrl);

    const saved = localStorage.getItem(POSITION_KEY(edgeCaseId));
    const resumeAt = saved ? parseFloat(saved) : 0;

    const start = () => {
      if (resumeAt > 0 && Number.isFinite(resumeAt)) {
        try {
          el.currentTime = resumeAt;
        } catch {
          el.currentTime = 0;
        }
      } else {
        el.currentTime = 0;
      }
      el.load();
      const playAttempt = el.play();
      if (playAttempt) {
        playAttempt.catch((err) => {
          console.warn("[edgecase] autoplay blocked or failed", err);
        });
      }
    };

    if (el.readyState >= 1) start();
    else el.addEventListener("loadedmetadata", start, { once: true });

    return () => {
      el.removeEventListener("loadedmetadata", start);
    };
  }, [videoUrl, playSession, edgeCaseId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const savePosition = () => {
      if (el.currentTime > 0 && !el.ended) {
        localStorage.setItem(POSITION_KEY(edgeCaseId), String(el.currentTime));
      }
    };

    const interval = setInterval(savePosition, 2000);
    return () => {
      clearInterval(interval);
      savePosition();
    };
  }, [edgeCaseId]);

  useEffect(() => {
    return () => {
      const el = videoRef.current;
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      for (const source of el.querySelectorAll("source")) {
        source.removeAttribute("src");
      }
      el.load();
    };
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      {buffering ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/40">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        </div>
      ) : null}
      <video
        ref={videoRef}
        key={`${videoUrl}-${playSession}`}
        autoPlay
        muted
        controls
        playsInline
        preload="metadata"
        className="h-full w-full rounded-2xl bg-black object-contain"
        onLoadedData={() => console.log("[edgecase] onLoadedData")}
        onCanPlay={() => {
          console.log("[edgecase] onCanPlay");
          setBuffering(false);
          const el = videoRef.current;
          if (el?.paused) {
            void el.play().catch((err) => {
              console.warn("[edgecase] play on canplay failed", err);
            });
          }
        }}
        onPlaying={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onError={(e) => {
          const media = e.currentTarget;
          console.error("[edgecase] onError", media.error, videoUrl);
          setBuffering(false);
          onPlaybackError?.("Video failed to load");
        }}
      >
        <source src={videoUrl} type={mimeType} />
      </video>
    </div>
  );
}
