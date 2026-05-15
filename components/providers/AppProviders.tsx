"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToasterProvider } from "@/components/providers/ToasterProvider";

/**
 * Client-side providers for the entire App Router tree.
 * Mounted once from app/layout.tsx so every page can use theme + toasts.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ToasterProvider />
    </ThemeProvider>
  );
}
