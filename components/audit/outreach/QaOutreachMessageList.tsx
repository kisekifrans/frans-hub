"use client";

import { useState } from "react";
import { Check, Copy, MessageSquare } from "lucide-react";
import type { GeneratedOutreachMessage } from "@/lib/audit/outreach/types";
import { cn } from "@/lib/utils";

interface QaOutreachMessageListProps {
  messages: GeneratedOutreachMessage[];
}

const btnClass =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition";

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function ruleBadgeClass(ruleId: string): string {
  if (ruleId === "low") {
    return "bg-amber-500/15 text-amber-800 dark:text-amber-300";
  }
  if (ruleId === "high") {
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  }
  return "bg-violet-500/15 text-violet-800 dark:text-violet-300";
}

export function QaOutreachMessageList({ messages }: QaOutreachMessageListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    await copyText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleCopyAll = async () => {
    const blob = messages.map((m) => m.message).join("\n\n---\n\n");
    await copyText(blob);
    setCopiedId("__all__");
    setTimeout(() => setCopiedId(null), 1600);
  };

  if (messages.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Generated Messages
          </h2>
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-violet-700 dark:text-violet-300">
            {messages.length}
          </span>
        </div>
        <button
          type="button"
          className={cn(
            btnClass,
            "glass-card text-zinc-700 hover:bg-white/55 dark:text-zinc-200 dark:hover:bg-white/15",
          )}
          onClick={() => void handleCopyAll()}
        >
          {copiedId === "__all__" ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copiedId === "__all__" ? "Copied all" : "Copy all"}
        </button>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {messages.map((m) => {
          const copied = copiedId === m.record.id;
          return (
            <li
              key={m.record.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-white/60 to-white/30 shadow-sm dark:border-white/10 dark:from-zinc-900/80 dark:to-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/40 bg-white/30 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {m.record.email}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.record.role ? (
                      <span className="rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:text-zinc-400">
                        {m.record.role}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        ruleBadgeClass(m.ruleId),
                      )}
                    >
                      {m.ruleLabel}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={cn(
                    btnClass,
                    copied
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-violet-600 text-white shadow-md shadow-violet-500/25 hover:bg-violet-500",
                  )}
                  onClick={() => void handleCopy(m.record.id, m.message)}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-px border-b border-white/30 bg-white/20 dark:border-white/10 dark:bg-white/5">
                <Stat label="Reviews" value={String(m.record.reviews)} highlight />
                <Stat label="Pace" value={m.record.medianPace || "—"} />
                <Stat label="Hours" value={m.record.hours || "—"} />
              </div>

              <div className="relative flex-1 p-4">
                <div
                  className="pointer-events-none absolute left-6 top-6 h-3 w-3 rotate-45 rounded-sm bg-zinc-100 dark:bg-zinc-800"
                  aria-hidden
                />
                <div className="rounded-2xl rounded-tl-sm bg-zinc-100/90 px-4 py-3.5 dark:bg-zinc-800/90">
                  <p className="whitespace-pre-wrap text-[13px] leading-[1.65] text-zinc-800 dark:text-zinc-100">
                    {m.message}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-3 py-2 text-center">
      <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs font-semibold tabular-nums text-zinc-800 dark:text-zinc-100",
          highlight && "text-violet-600 dark:text-violet-300",
        )}
      >
        {value}
      </p>
    </div>
  );
}
