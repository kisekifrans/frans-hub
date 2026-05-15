"use client";

import { Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { TopLinkStat } from "@/lib/types";

interface TopLinksTableProps {
  links: TopLinkStat[];
}

export function TopLinksTable({ links }: TopLinksTableProps) {
  return (
    <GlassCard padding="md" className="col-span-full">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        <Trophy className="h-4 w-4 text-amber-500" />
        Top performing links
      </h3>
      {links.length === 0 ? (
        <p className="text-sm text-zinc-500">No link clicks in this period yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/15 text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Link</th>
                <th className="pb-2 pr-4 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link, i) => (
                <tr
                  key={link.blockId}
                  className="border-b border-white/10 last:border-0"
                >
                  <td className="py-2.5 pr-4 text-zinc-400">{i + 1}</td>
                  <td className="max-w-[180px] truncate py-2.5 pr-4 font-medium text-zinc-800 dark:text-zinc-100 sm:max-w-none">
                    {link.title}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-violet-600 dark:text-violet-300">
                    {link.clicks.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-zinc-500">
                    {link.share}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
