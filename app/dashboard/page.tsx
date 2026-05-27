import { LinkHubEditor } from "@/components/dashboard/LinkHubEditor";
import { NonLocalizedIntlShell } from "@/components/i18n/NonLocalizedIntlShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your links · Kawaragi",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <NonLocalizedIntlShell>
      <LinkHubEditor />
    </NonLocalizedIntlShell>
  );
}
