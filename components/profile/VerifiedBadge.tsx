import { BadgeCheck } from "lucide-react";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const badgeByTheme: Record<Profile["theme"], string> = {
  violet:
    "border-violet-400/30 bg-violet-500/15 text-violet-700 dark:text-violet-200",
  cyan: "border-cyan-400/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200",
  rose: "border-rose-400/30 bg-rose-500/15 text-rose-700 dark:text-rose-200",
  emerald:
    "border-emerald-400/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
};

export function VerifiedBadge({ theme }: { theme: Profile["theme"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        badgeByTheme[theme],
      )}
      title="Verified creator"
    >
      <BadgeCheck className="h-3 w-3" aria-hidden />
      Verified
    </span>
  );
}
