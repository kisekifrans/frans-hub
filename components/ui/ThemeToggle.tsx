"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className={
        className ??
        "glass-card flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/30 p-0 backdrop-blur-xl transition hover:bg-white/50 disabled:opacity-70 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
      }
    >
      {!mounted ? (
        <span className="h-4 w-4 rounded-full bg-zinc-400/50" aria-hidden />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-300" />
      ) : (
        <Moon className="h-4 w-4 text-violet-600" />
      )}
    </button>
  );
}
