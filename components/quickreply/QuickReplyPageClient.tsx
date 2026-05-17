"use client";

import dynamic from "next/dynamic";
import { QuickReplyGuard } from "@/components/quickreply/QuickReplyGuard";

const QuickReplyApp = dynamic(
  () =>
    import("@/components/quickreply/QuickReplyApp").then((m) => m.QuickReplyApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        Memuat Quick Reply…
      </div>
    ),
  },
);

export function QuickReplyPageClient() {
  return (
    <QuickReplyGuard>
      <QuickReplyApp />
    </QuickReplyGuard>
  );
}
