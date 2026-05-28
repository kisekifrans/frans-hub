"use client";

import { Link2, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

interface DiscordIdAssignCardProps {
  pendingCount: number;
  assignedCount: number;
  discordIdPaste: string;
  onPasteChange: (value: string) => void;
  onAssign: () => void;
  onClear: () => void;
  preview: { email: string; discordId: string }[];
}

export function DiscordIdAssignCard({
  pendingCount,
  assignedCount,
  discordIdPaste,
  onPasteChange,
  onAssign,
  onClear,
  preview,
}: DiscordIdAssignCardProps) {
  if (pendingCount === 0) return null;

  return (
    <GlassCard padding="lg" className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Assign Discord IDs (In Order)
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Same order as filtered messages below ({pendingCount} pending). Paste
          mentions or IDs — e.g.{" "}
          <code className="rounded bg-white/40 px-1 dark:bg-white/10">
            &lt;@123…&gt; &lt;@456…&gt;
          </code>{" "}
          or one ID per line.
        </p>
      </div>
      <textarea
        className={cn(inputClass, "min-h-[100px] font-mono text-xs")}
        placeholder="<@123456789012345678>&#10;<@987654321098765432>&#10;…"
        value={discordIdPaste}
        onChange={(e) => onPasteChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnClass} onClick={onAssign}>
          <Link2 className="h-3.5 w-3.5" />
          Assign to {pendingCount} messages
        </button>
        {assignedCount > 0 ? (
          <button type="button" className={btnClass} onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear assignments
          </button>
        ) : null}
        <span className="text-xs text-zinc-500">
          {assignedCount} linked · each Discord send will @mention that user
        </span>
      </div>
      {preview.length > 0 ? (
        <div className="max-h-40 overflow-auto rounded-xl border border-white/40 bg-white/20 p-2 dark:border-white/10 dark:bg-white/5">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-zinc-500">
                <th className="px-2 py-1 font-medium">#</th>
                <th className="px-2 py-1 font-medium">Email</th>
                <th className="px-2 py-1 font-medium">Discord ID</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 30).map((row, i) => (
                <tr key={row.email} className="border-t border-white/20">
                  <td className="px-2 py-1 tabular-nums text-zinc-400">{i + 1}</td>
                  <td className="max-w-[180px] truncate px-2 py-1">{row.email}</td>
                  <td className="px-2 py-1 font-mono text-violet-600 dark:text-violet-300">
                    {row.discordId ? `<@${row.discordId}>` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 30 ? (
            <p className="mt-1 px-2 text-[10px] text-zinc-400">
              +{preview.length - 30} more…
            </p>
          ) : null}
        </div>
      ) : null}
    </GlassCard>
  );
}
