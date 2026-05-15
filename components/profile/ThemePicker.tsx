import type { Profile } from "@/lib/types";

const themes: { id: Profile["theme"]; label: string }[] = [
  { id: "violet", label: "Violet" },
  { id: "cyan", label: "Cyan" },
  { id: "rose", label: "Rose" },
  { id: "emerald", label: "Emerald" },
];

interface ThemePickerProps {
  value: Profile["theme"];
  onChange: (theme: Profile["theme"]) => void;
  className?: string;
}

export function ThemePicker({ value, onChange, className }: ThemePickerProps) {
  return (
    <label className={className ?? "block text-sm font-medium text-zinc-600 dark:text-zinc-300"}>
      Theme accent
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Profile["theme"])}
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
