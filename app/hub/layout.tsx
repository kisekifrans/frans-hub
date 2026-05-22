import { NonLocalizedIntlShell } from "@/components/i18n/NonLocalizedIntlShell";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NonLocalizedIntlShell>{children}</NonLocalizedIntlShell>;
}
