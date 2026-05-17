import { defineRouting } from "next-intl/routing";

export const locales = ["id", "en", "zh"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "id",
  localePrefix: "always",
  localeDetection: true,
});

export const localeCookieName = "NEXT_LOCALE";
