import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LinkHubEditor } from "@/components/dashboard/LinkHubEditor";
import { PageShell } from "@/components/ui/PageShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your links · Kawaragi",
  robots: { index: false, follow: false },
};

function DashboardLoading() {
  return (
    <PageShell contentClassName="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </PageShell>
  );
}

export default function DashboardPage() {
  // LinkHubEditor uses useSearchParams() for the ?tab= deep-link. Next.js 15
  // requires that hook to live inside a Suspense boundary; without one the
  // whole route bails out and the browser shows its native "couldn't load"
  // error page in production.
  return (
    <Suspense fallback={<DashboardLoading />}>
      <LinkHubEditor />
    </Suspense>
  );
}
