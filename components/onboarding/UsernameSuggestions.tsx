"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Suggestion = { slug: string; available: boolean };

type Props = {
  onPick: (slug: string) => void;
  selected?: string;
};

export function UsernameSuggestions({ onPick, selected }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile/username-suggestions")
      .then((r) => (r.ok ? r.json() : { suggestions: [] }))
      .then((data: { suggestions?: Suggestion[] }) => {
        setSuggestions(data.suggestions ?? []);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, []);

  const available = suggestions.filter((s) => s.available);

  if (loading) {
    return (
      <p className="text-xs text-zinc-500">Finding ideas for your link…</p>
    );
  }

  if (!available.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500">
        Dari email &amp; nama kamu
      </p>
      <div className="flex flex-wrap gap-2">
        {available.map((s, i) => (
          <motion.button
            key={s.slug}
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onPick(s.slug)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              selected === s.slug
                ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "border-white/30 bg-white/40 text-zinc-700 hover:bg-white/60 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/20",
            )}
          >
            /{s.slug}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
