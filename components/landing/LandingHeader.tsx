"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LandingHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "landing-header sticky top-0 z-50 transition-[background,box-shadow,border-color,padding] duration-300 ease-out",
        scrolled
          ? "border-b border-zinc-200/60 py-2 shadow-[0_2px_20px_rgba(91,33,182,0.05)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/8 dark:bg-zinc-950/72 dark:shadow-[0_2px_24px_rgba(0,0,0,0.4)]"
          : "border-b border-transparent py-2.5 backdrop-blur-md dark:bg-zinc-950/20",
        !scrolled && "bg-white/30 dark:bg-transparent",
        scrolled && "bg-white/80",
      )}
    >
      {children}
    </header>
  );
}
