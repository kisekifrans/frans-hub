"use client";

import dynamic from "next/dynamic";

const TypingMonsterApp = dynamic(
  () =>
    import("@/components/typingmonster/TypingMonsterApp").then((mod) => ({
      default: mod.TypingMonsterApp,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading battle...</p>
      </div>
    ),
  },
);

export function TypingMonsterPageClient() {
  return <TypingMonsterApp />;
}
