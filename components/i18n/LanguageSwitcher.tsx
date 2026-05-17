"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const FLAGS: Record<AppLocale, string> = {
  id: "🇮🇩",
  en: "🇺🇸",
  zh: "🇨🇳",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const switchLocale = (next: AppLocale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    router.replace(pathname, { locale: next });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("label")}
        className={cn(
          "glass-card flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
          "hover:-translate-y-0.5 hover:bg-white/55 dark:hover:bg-white/15 sm:h-10 sm:w-10",
          open && "ring-2 ring-violet-500/40",
        )}
      >
        <Globe className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="glass-card absolute right-0 z-30 mt-2 min-w-[168px] overflow-hidden rounded-2xl border py-1 shadow-xl shadow-violet-500/10"
        >
          {routing.locales.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => switchLocale(code)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition",
                  "hover:bg-white/45 dark:hover:bg-white/10",
                  code === locale &&
                    "bg-violet-500/10 font-medium text-violet-700 dark:text-violet-200",
                )}
              >
                <span className="text-base leading-none" aria-hidden>
                  {FLAGS[code]}
                </span>
                <span>{t(code)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
