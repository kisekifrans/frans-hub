"use client";

import dynamic from "next/dynamic";
import { TypingTrainerSkeleton } from "@/components/typing/TypingTrainerSkeleton";

const TypingTrainer = dynamic(
  () =>
    import("@/components/typing/TypingTrainer").then((mod) => ({
      default: mod.TypingTrainer,
    })),
  { ssr: false, loading: () => <TypingTrainerSkeleton /> },
);

export function TypingPageClient() {
  return <TypingTrainer />;
}
