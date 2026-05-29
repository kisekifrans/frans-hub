import { QaOutreachPageClient } from "@/components/tools/qa-outreach/QaOutreachPageClient";

export const metadata = {
  title: "QA Tools | Agisna Dev",
  description:
    "Team tools for QA outreach messages and review analytics from User Management CSV exports.",
  robots: { index: false, follow: false },
};

export default function QaOutreachPage() {
  return <QaOutreachPageClient />;
}
