"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useAcademicAuditCopy } from "@/hooks/useAcademicAuditCopy";
import type { ExclusionOptions } from "@/lib/academicaudit/types";
import { cn } from "@/lib/utils";

interface AnalysisOptionsProps {
  value: ExclusionOptions;
  onChange: (next: ExclusionOptions) => void;
  disabled?: boolean;
}

export function AnalysisOptions({
  value,
  onChange,
  disabled,
}: AnalysisOptionsProps) {
  const copy = useAcademicAuditCopy();

  const checkboxOptions: {
    key: keyof Omit<ExclusionOptions, "excludePages">;
    label: string;
  }[] = [
    { key: "excludeToc", label: copy.excludeToc },
    { key: "excludeBibliography", label: copy.excludeBibliography },
    { key: "excludeAppendix", label: copy.excludeAppendix },
    { key: "excludeCaptions", label: copy.excludeCaptions },
  ];

  return (
    <GlassCard padding="md" className="mt-4 border border-violet-300/20">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
        {copy.optionsTitle}
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {copy.optionsHint}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {checkboxOptions.map(({ key, label }) => {
          const checked = value[key];
          return (
            <li key={key}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/25 px-3 py-2.5 text-sm transition",
                  "hover:bg-white/40 dark:hover:bg-white/8",
                  checked && "bg-violet-500/10 border-violet-400/30",
                  disabled && "pointer-events-none opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-400/40"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ ...value, [key]: e.target.checked })
                  }
                />
                <span className="text-zinc-700 dark:text-zinc-200">{label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {copy.excludePagesLabel}
        </label>
        <p className="mt-0.5 text-[11px] text-zinc-500">{copy.excludePagesHint}</p>
        <input
          type="text"
          value={value.excludePages}
          disabled={disabled}
          placeholder="1,2,5,10-15"
          onChange={(e) =>
            onChange({ ...value, excludePages: e.target.value })
          }
          className={cn(
            "mt-2 w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2.5 text-sm text-zinc-800",
            "placeholder:text-zinc-400 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/20",
            "dark:border-white/10 dark:bg-white/5 dark:text-zinc-100",
            disabled && "opacity-50",
          )}
        />
      </div>
    </GlassCard>
  );
}
