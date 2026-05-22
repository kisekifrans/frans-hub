"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { UsernamePicker } from "@/components/onboarding/UsernamePicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { useUsernamePicker } from "@/hooks/useUsernamePicker";

type Props = {
  initialSlug: string;
  currentSlug?: string;
  hint?: string;
  onUpdated?: (slug: string) => void;
};

/** Manage public username from dashboard profile settings. */
export function PublicLinkSlugField({
  initialSlug,
  currentSlug,
  hint,
  onUpdated,
}: Props) {
  const active = currentSlug ?? initialSlug;
  const picker = useUsernamePicker({
    initialUsername: initialSlug,
    currentUsername: active,
  });

  return (
    <GlassCard padding="md" className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Public link
      </p>
      {hint && (
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      <UsernamePicker
        variant="compact"
        picker={picker}
        onSuccess={() => {
          onUpdated?.(picker.username);
          toast.success(`Live at /${picker.username}`);
        }}
      />
      <Link
        href={`/${picker.username || active}`}
        target="_blank"
        className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
      >
        <ExternalLink className="h-3 w-3" />
        Open public page
      </Link>
    </GlassCard>
  );
}
