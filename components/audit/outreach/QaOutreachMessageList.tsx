"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageSquare,
  Send,
} from "lucide-react";
import type { SentArchiveEntry } from "@/lib/audit/outreach/sent-archive";
import {
  loadDiscordConfig,
  resolveDiscordMentionId,
} from "@/lib/audit/outreach/discord-config";
import type { GeneratedOutreachMessage } from "@/lib/audit/outreach/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QaOutreachMessageListProps {
  messages: GeneratedOutreachMessage[];
  sentArchive: SentArchiveEntry[];
  onMarkSent: (entry: Omit<SentArchiveEntry, "sentAt">) => void;
  onClearArchive: () => void;
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

export function QaOutreachMessageList({
  messages,
  sentArchive,
  onMarkSent,
  onClearArchive,
}: QaOutreachMessageListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(true);

  const sentIds = useMemo(
    () => new Set(sentArchive.map((e) => e.recordId)),
    [sentArchive],
  );

  const pending = useMemo(
    () => messages.filter((m) => !sentIds.has(m.record.id)),
    [messages, sentIds],
  );

  const sentMessages = useMemo(() => {
    const byId = new Map(messages.map((m) => [m.record.id, m]));
    return sentArchive
      .map((entry) => {
        const msg = byId.get(entry.recordId);
        return msg ? { entry, message: msg } : null;
      })
      .filter(Boolean) as { entry: SentArchiveEntry; message: GeneratedOutreachMessage }[];
  }, [messages, sentArchive]);

  const handleCopy = async (id: string, text: string) => {
    await copyText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleDiscordSend = async (m: GeneratedOutreachMessage) => {
    const discord = loadDiscordConfig();

    setSendingId(m.record.id);
    try {
      const mentionUserId = resolveDiscordMentionId(m.record.email, discord);
      const res = await fetch("/api/tools/qa-outreach/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: m,
          webhookUrl: discord.webhookUrl || undefined,
          username: discord.username,
          avatarUrl: discord.avatarUrl || undefined,
          mentionUserId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Discord send failed");
        return;
      }
      onMarkSent({
        recordId: m.record.id,
        email: m.record.email,
        ruleLabel: m.ruleLabel,
      });
      toast.success(`Sent to Discord · ${m.record.email}`);
    } catch {
      toast.error("Discord send failed");
    } finally {
      setSendingId(null);
    }
  };

  if (messages.length === 0) return null;

  return (
    <div className="space-y-6">
      <MessageSection
        title="Generated Messages"
        count={pending.length}
        emptyLabel="All messages sent — see archive below."
      >
        {pending.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">
            No pending messages.
          </p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {pending.map((m) => (
              <MessageCard
                key={m.record.id}
                message={m}
                copied={copiedId === m.record.id}
                sending={sendingId === m.record.id}
                onCopy={() => void handleCopy(m.record.id, m.message)}
                onDiscord={() => void handleDiscordSend(m)}
              />
            ))}
          </ul>
        )}
      </MessageSection>

      {sentMessages.length > 0 ? (
        <div className="space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => setShowArchive(!showArchive)}
          >
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Sent Archive
              </h2>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                {sentMessages.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(btnClass, "glass-card")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      "Clear sent archive for this CSV import? You can send again.",
                    )
                  ) {
                    onClearArchive();
                  }
                }}
              >
                Clear archive
              </button>
              {showArchive ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </div>
          </button>
          {showArchive ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {sentMessages.map(({ entry, message: m }) => (
                <li
                  key={entry.recordId}
                  className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 dark:border-emerald-500/20"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                        {m.record.email}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {m.ruleLabel} ·{" "}
                        {new Date(entry.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MessageSection({
  title,
  count,
  children,
  emptyLabel,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  emptyLabel?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-violet-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </h2>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-violet-700 dark:text-violet-300">
          {count}
        </span>
      </div>
      {count === 0 && emptyLabel ? (
        <p className="text-center text-sm text-zinc-500">{emptyLabel}</p>
      ) : null}
      {children}
    </div>
  );
}

function MessageCard({
  message: m,
  copied,
  sending,
  onCopy,
  onDiscord,
}: {
  message: GeneratedOutreachMessage;
  copied: boolean;
  sending: boolean;
  onCopy: () => void;
  onDiscord: () => void;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-white/60 to-white/30 shadow-sm dark:border-white/10 dark:from-zinc-900/80 dark:to-zinc-900/40">
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
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <button
            type="button"
            className={cn(
              btnClass,
              "glass-card text-zinc-700 dark:text-zinc-200",
            )}
            onClick={onCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            disabled={sending}
            className={cn(
              btnClass,
              "bg-[#5865F2] text-white hover:bg-[#4752c4] disabled:opacity-60",
            )}
            onClick={onDiscord}
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? "Sending…" : "Discord"}
          </button>
        </div>
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
