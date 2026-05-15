"use client";

import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/types";

interface SocialLinksEditorProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

function toDraft(links: SocialLink[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of SOCIAL_PLATFORMS) map[p.id] = "";
  for (const l of links) map[l.platform] = l.url;
  return map;
}

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  const draft = toDraft(links);

  const update = (platform: SocialLink["platform"], url: string) => {
    const next = SOCIAL_PLATFORMS.filter((p) => {
      const value = p.id === platform ? url : draft[p.id];
      return value?.trim();
    }).map((p) => ({
      platform: p.id,
      url: (p.id === platform ? url : draft[p.id]).trim(),
    }));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
        Social links
      </p>
      {SOCIAL_PLATFORMS.map((p) => (
        <label
          key={p.id}
          className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          {p.label}
          <input
            type="url"
            defaultValue={draft[p.id]}
            key={`${p.id}-${draft[p.id]}`}
            placeholder={`https://${p.id === "website" ? "yoursite.com" : p.id + ".com"}`}
            onBlur={(e) => update(p.id, e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
          />
        </label>
      ))}
    </div>
  );
}
