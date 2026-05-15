import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export function AdminSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/30 dark:bg-white/10",
        className,
      )}
    />
  );
}

export function CollectionsListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <GlassCard key={i} padding="md" className="space-y-3">
          <AdminSkeleton className="h-5 w-2/3" />
          <AdminSkeleton className="h-4 w-full" />
          <AdminSkeleton className="h-4 w-1/2" />
        </GlassCard>
      ))}
    </div>
  );
}
