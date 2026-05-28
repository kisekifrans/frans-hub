import { QaOutreachPageClient } from "@/components/tools/qa-outreach/QaOutreachPageClient";

export const metadata = {
  title: "QA Outreach | Agisna Dev",
  description: "Team tool for QA productivity outreach messages from User Management CSV exports.",
  robots: { index: false, follow: false },
};

export default function QaOutreachPage() {
  return <QaOutreachPageClient />;
}
