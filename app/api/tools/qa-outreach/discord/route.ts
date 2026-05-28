import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildDiscordWebhookPayload } from "@/lib/audit/outreach/discord-payload";
import type { GeneratedOutreachMessage } from "@/lib/audit/outreach/types";
import {
  QA_OUTREACH_COOKIE,
  isQaOutreachSessionAuthorized,
} from "@/lib/tools/qa-outreach-auth";

interface DiscordSendBody {
  message: GeneratedOutreachMessage;
  webhookUrl?: string;
  username?: string;
  avatarUrl?: string;
  mentionUserId?: string;
}

function resolveWebhookUrl(override?: string): string | null {
  const env = process.env.DISCORD_QA_OUTREACH_WEBHOOK_URL?.trim();
  if (env) return env;
  const fromClient = override?.trim();
  if (
    fromClient &&
    /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/i.test(
      fromClient,
    )
  ) {
    return fromClient;
  }
  return null;
}

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(QA_OUTREACH_COOKIE)?.value;
  if (!isQaOutreachSessionAuthorized(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DiscordSendBody;
  try {
    body = (await request.json()) as DiscordSendBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.message?.record?.email || !body.message?.message) {
    return NextResponse.json({ error: "Missing message payload" }, { status: 400 });
  }

  const webhookUrl = resolveWebhookUrl(body.webhookUrl);
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Discord webhook not configured" },
      { status: 400 },
    );
  }

  const payload = buildDiscordWebhookPayload(body.message, {
    username: body.username?.trim() || "QA Outreach",
    avatarUrl: body.avatarUrl,
    mentionUserId: body.mentionUserId,
  });

  const res = await fetch(`${webhookUrl}?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: text || `Discord returned ${res.status}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
