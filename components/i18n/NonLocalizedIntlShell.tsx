import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

/** Wraps non-`/[locale]` routes that still use `useTranslations` (e.g. `/hub/[slug]`). */
export async function NonLocalizedIntlShell({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
