"use client";

import { useState } from "react";
import { Columns3, ChevronDown } from "lucide-react";
import {
  EXPORT_COLUMN_KEYS,
  EXPORT_COLUMN_LABELS,
  type ExportColumnKey,
} from "@/lib/audit/export-columns";
import { cn } from "@/lib/utils";

interface AuditExportColumnsProps {
  selected: ExportColumnKey[];
  onChange: (columns: ExportColumnKey[]) => void;
}

const btnClass =
  "glass-card inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

export function AuditExportColumns({
  selected,
  onChange,
}: AuditExportColumnsProps) {
  const [open, setOpen] = useState(false);

  const toggle = (key: ExportColumnKey) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    const ordered = EXPORT_COLUMN_KEYS.filter((k) => next.includes(k));
    onChange(ordered);
  };

  const selectAll = () => onChange([...EXPORT_COLUMN_KEYS]);
  const selectNone = () => onChange([]);

  return (
    <div className="relative">
      <button
        type="button"
        className={btnClass}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Columns3 className="h-3.5 w-3.5" />
        Export columns
        <span className="text-zinc-400">({selected.length})</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1.5 min-w-[16rem] rounded-xl border border-white/40 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95">
            <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Include in CSV
            </span>
            <div className="flex gap-2 text-[10px]">
              <button
                type="button"
                className="text-violet-600 hover:underline dark:text-violet-300"
                onClick={selectAll}
              >
                All
              </button>
              <button
                type="button"
                className="text-zinc-500 hover:underline"
                onClick={selectNone}
              >
                None
              </button>
            </div>
          </div>
          <div className="grid max-h-48 gap-1 overflow-y-auto sm:grid-cols-2">
            {EXPORT_COLUMN_KEYS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-xs text-zinc-700 hover:bg-white/50 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  checked={selected.includes(key)}
                  onChange={() => toggle(key)}
                />
                <span className="truncate">{EXPORT_COLUMN_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
