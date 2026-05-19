"use client";

import { Search } from "lucide-react";
import type { EdgeCaseFilters } from "@/lib/edgecases/types";
import { cn } from "@/lib/utils";

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
    active
      ? "bg-violet-600 text-white"
      : "glass-card text-zinc-600 dark:text-zinc-300",
  );

interface EdgeCaseFiltersBarProps {
  filters: EdgeCaseFilters;
  projects: string[];
  onChange: (f: EdgeCaseFilters) => void;
}

export function EdgeCaseFiltersBar({
  filters,
  projects,
  onChange,
}: EdgeCaseFiltersBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search title, reject reason, tags, project…"
          className="w-full rounded-xl border border-white/30 bg-white/40 py-2.5 pl-9 pr-3 text-sm dark:bg-white/5"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "approve", "reject", "pending"] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={chip(filters.decision === d)}
            onClick={() => onChange({ ...filters, decision: d })}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className={chip(filters.favoritesOnly)}
          onClick={() =>
            onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
          }
        >
          ★ Favorites
        </button>
        {(["all", "7d", "30d"] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={chip(filters.datePreset === d)}
            onClick={() => onChange({ ...filters, datePreset: d })}
          >
            {d === "all" ? "All time" : d}
          </button>
        ))}
      </div>

      {projects.length > 0 && (
        <select
          value={filters.project}
          onChange={(e) => onChange({ ...filters, project: e.target.value })}
          className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm sm:max-w-xs dark:bg-white/5"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
