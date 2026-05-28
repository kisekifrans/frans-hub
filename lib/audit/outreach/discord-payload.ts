import type { GeneratedOutreachMessage } from "./types";

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds: DiscordEmbed[];
  allowed_mentions?: {
    parse?: ("roles" | "users" | "everyone")[];
    users?: string[];
  };
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  footer?: { text: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

function ruleColor(ruleId: string): number {
  if (ruleId === "low") return 0xf59e0b;
  if (ruleId === "high") return 0x10b981;
  return 0x8b5cf6;
}

export function buildDiscordWebhookPayload(
  message: GeneratedOutreachMessage,
  opts: {
    username: string;
    avatarUrl?: string;
    mentionUserId?: string;
  },
): DiscordWebhookPayload {
  const { record } = message;
  const description =
    message.message.length > 4096
      ? `${message.message.slice(0, 4093)}...`
      : message.message;

  const fields = [
    { name: "Reviews", value: String(record.reviews), inline: true },
    { name: "Median pace", value: record.medianPace || "—", inline: true },
    { name: "Hours", value: record.hours || "—", inline: true },
  ];
  if (record.role) {
    fields.push({ name: "Role", value: record.role, inline: true });
  }

  const payload: DiscordWebhookPayload = {
    username: opts.username || "QA Outreach",
    embeds: [
      {
        title: record.email,
        description,
        color: ruleColor(message.ruleId),
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  if (opts.avatarUrl?.trim()) {
    payload.avatar_url = opts.avatarUrl.trim();
  }

  if (opts.mentionUserId) {
    payload.content = `<@${opts.mentionUserId}>`;
    payload.allowed_mentions = { users: [opts.mentionUserId] };
  }

  return payload;
}
