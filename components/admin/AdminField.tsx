"use client";

import { cn } from "@/lib/utils";

interface AdminFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "color";
  placeholder?: string;
  hint?: string;
  className?: string;
}

export function AdminField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  className,
}: AdminFieldProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-zinc-600 dark:text-zinc-300",
        className,
      )}
    >
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
      />
      {hint && (
        <span className="mt-1 block text-xs font-normal text-zinc-500">{hint}</span>
      )}
    </label>
  );
}

interface AdminTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function AdminTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: AdminTextareaProps) {
  return (
    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full resize-y rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
      />
    </label>
  );
}

interface AdminSelectProps<T extends string> {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}

export function AdminSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: AdminSelectProps<T>) {
  return (
    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
