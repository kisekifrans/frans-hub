"use client";

import {
  Clock,
  FolderOpen,
  Pin,
  Plus,
  Star,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { SidebarFilter } from "@/lib/quickreply/types";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  categories: string[];
  filter: SidebarFilter;
  onFilter: (f: SidebarFilter) => void;
  onNewCategory: (name: string) => void;
  onCreate: () => void;
  recentCount: number;
}

function NavBtn({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition",
        active
          ? "bg-violet-500/15 font-medium text-violet-800 dark:text-violet-200"
          : "text-zinc-600 hover:bg-white/50 dark:text-zinc-400 dark:hover:bg-white/8",
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-70" /> : null}
      {children}
    </button>
  );
}

export function CategorySidebar({
  categories,
  filter,
  onFilter,
  onNewCategory,
  onCreate,
  recentCount,
}: CategorySidebarProps) {
  const isActive = (f: SidebarFilter): boolean => {
    if (filter.type !== f.type) return false;
    if (f.type === "category" && filter.type === "category") {
      return filter.category === f.category;
    }
    return true;
  };

  return (
    <GlassCard padding="md" className="signature-glow h-fit">
      <button
        type="button"
        onClick={onCreate}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        Snippet Baru
      </button>

      <nav className="space-y-1">
        <NavBtn
          active={isActive({ type: "all" })}
          onClick={() => onFilter({ type: "all" })}
          icon={FolderOpen}
        >
          Semua
        </NavBtn>
        <NavBtn
          active={isActive({ type: "pinned" })}
          onClick={() => onFilter({ type: "pinned" })}
          icon={Pin}
        >
          Disematkan
        </NavBtn>
        <NavBtn
          active={isActive({ type: "favorites" })}
          onClick={() => onFilter({ type: "favorites" })}
          icon={Star}
        >
          Favorit
        </NavBtn>
        <NavBtn
          active={isActive({ type: "recent" })}
          onClick={() => onFilter({ type: "recent" })}
          icon={Clock}
        >
          Terakhir disalin
          {recentCount > 0 ? (
            <span className="ml-auto text-xs text-zinc-400">{recentCount}</span>
          ) : null}
        </NavBtn>
      </nav>

      <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Kategori
      </p>
      <div className="max-h-48 space-y-0.5 overflow-y-auto pr-1">
        {categories.map((cat) => (
          <NavBtn
            key={cat}
            active={filter.type === "category" && filter.category === cat}
            onClick={() => onFilter({ type: "category", category: cat })}
          >
            {cat}
          </NavBtn>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("cat") ?? "").trim();
          if (name) {
            onNewCategory(name);
            onFilter({ type: "category", category: name });
            e.currentTarget.reset();
          }
        }}
      >
        <input
          name="cat"
          placeholder="Kategori baru"
          className="min-w-0 flex-1 rounded-lg border border-white/30 bg-white/40 px-2 py-2 text-xs dark:border-white/10 dark:bg-white/5"
        />
        <button
          type="submit"
          className="rounded-lg border border-violet-300/40 px-2 text-xs font-medium text-violet-700 dark:text-violet-300"
        >
          +
        </button>
      </form>
    </GlassCard>
  );
}
