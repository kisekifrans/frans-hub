"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/** Syncs <html lang> with the active locale (root layout keeps a default). */
export function LocaleHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : locale;
  }, [locale]);

  return null;
}
