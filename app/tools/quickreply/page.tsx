import { QuickReplyPageClient } from "@/components/quickreply/QuickReplyPageClient";

export const metadata = {
  title: "Quick Reply | Agisna Dev",
  description:
    "Admin snippet manager untuk balasan Facebook chat — salin cepat, pratinjau Messenger.",
  robots: { index: false, follow: false },
};

export default function QuickReplyPage() {
  return <QuickReplyPageClient />;
}
