"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  DEFAULT_DISCORD_CONFIG,
  loadDiscordConfig,
  mentionMapToPaste,
  parseMentionMapPaste,
  saveDiscordConfig,
  type DiscordOutreachConfig,
} from "@/lib/audit/outreach/discord-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

export function DiscordSettingsCard() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<DiscordOutreachConfig>(DEFAULT_DISCORD_CONFIG);
  const [mentionPaste, setMentionPaste] = useState("");

  useEffect(() => {
    const loaded = loadDiscordConfig();
    setConfig(loaded);
    setMentionPaste(mentionMapToPaste(loaded.mentionMap));
  }, []);

  const save = () => {
    const next = {
      ...config,
      mentionMap: parseMentionMapPaste(mentionPaste),
    };
    saveDiscordConfig(next);
    setConfig(next);
    toast.success("Discord settings saved");
  };

  return (
    <GlassCard padding="lg" className="space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Discord
          </h2>
          <p className="text-xs text-zinc-500">
            Webhook URL, sender profile, and optional user mentions.
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        )}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-white/30 pt-4 dark:border-white/10">
          <label className="block space-y-1 text-xs text-zinc-500">
            Webhook URL
            <input
              type="url"
              className={cn(inputClass, "font-mono text-xs")}
              placeholder="https://discord.com/api/webhooks/..."
              value={config.webhookUrl}
              onChange={(e) =>
                setConfig({ ...config, webhookUrl: e.target.value })
              }
            />
          </label>
          <p className="text-[11px] text-zinc-400">
            Channel → Integrations → Webhooks → New Webhook → Copy URL. Or set{" "}
            <code className="rounded bg-white/40 px-1 dark:bg-white/10">
              DISCORD_QA_OUTREACH_WEBHOOK_URL
            </code>{" "}
            on the server (URL hidden from browser).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-zinc-500">
              Sender name
              <input
                className={inputClass}
                value={config.username}
                onChange={(e) =>
                  setConfig({ ...config, username: e.target.value })
                }
              />
            </label>
            <label className="space-y-1 text-xs text-zinc-500">
              Avatar URL
              <input
                type="url"
                className={inputClass}
                placeholder="https://..."
                value={config.avatarUrl}
                onChange={(e) =>
                  setConfig({ ...config, avatarUrl: e.target.value })
                }
              />
            </label>
          </div>
          <label className="block space-y-1 text-xs text-zinc-500">
            Default mention user ID (optional)
            <input
              className={cn(inputClass, "font-mono text-xs")}
              placeholder="Discord user snowflake ID"
              value={config.defaultMentionId}
              onChange={(e) =>
                setConfig({ ...config, defaultMentionId: e.target.value })
              }
            />
          </label>
          <label className="block space-y-1 text-xs text-zinc-500">
            Email → Discord ID (one per line: email, userId)
            <textarea
              className={cn(inputClass, "min-h-[80px] font-mono text-xs")}
              placeholder="user@example.com, 123456789012345678"
              value={mentionPaste}
              onChange={(e) => setMentionPaste(e.target.value)}
            />
          </label>
          <button type="button" className={btnClass} onClick={save}>
            <Save className="h-3.5 w-3.5" />
            Save Discord
          </button>
        </div>
      ) : null}
    </GlassCard>
  );
}
