import { LinkHubEditor } from "@/components/dashboard/LinkHubEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your links · Kawaragi",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <LinkHubEditor />;
}
