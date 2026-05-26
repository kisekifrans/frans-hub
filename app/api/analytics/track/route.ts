import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { parseUserAgent } from "@/lib/parse-user-agent";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ANALYTICS_LIMIT = 60;
const ANALYTICS_WINDOW_MS = 60_000;
const VISITOR_LIMIT = 30;
const VISITOR_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const ipLimited = rateLimit(
    `analytics:ip:${ip}`,
    ANALYTICS_LIMIT,
    ANALYTICS_WINDOW_MS,
  );
  if (!ipLimited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: ipLimited.retryAfterSec
          ? { "Retry-After": String(ipLimited.retryAfterSec) }
          : undefined,
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const profileId = typeof body.profileId === "string" ? body.profileId : "";
  const eventType = body.eventType;
  const blockId = typeof body.blockId === "string" ? body.blockId : null;
  const visitorIdRaw =
    typeof body.visitorId === "string" ? body.visitorId : null;

  if (
    !UUID_RE.test(profileId) ||
    (eventType !== "view" && eventType !== "click") ||
    (blockId != null && !UUID_RE.test(blockId))
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const visitorId = visitorIdRaw
    ? visitorIdRaw.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 128)
    : null;
  if (visitorId) {
    const vLimited = rateLimit(
      `analytics:visitor:${profileId}:${visitorId}`,
      VISITOR_LIMIT,
      VISITOR_WINDOW_MS,
    );
    if (!vLimited.ok) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  const supabase = await createClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_published")
    .eq("id", profileId)
    .maybeSingle();
  if (profileError || !profileRow) {
    return NextResponse.json({ error: "Unknown profile" }, { status: 404 });
  }
  if ((profileRow as { is_published?: boolean }).is_published === false) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (blockId) {
    const { data: blockRow } = await supabase
      .from("blocks")
      .select("id")
      .eq("id", blockId)
      .eq("profile_id", profileId)
      .maybeSingle();
    if (!blockRow) {
      return NextResponse.json({ error: "Unknown block" }, { status: 404 });
    }
  }

  const ua = request.headers.get("user-agent");
  const { deviceType, browser, os } = parseUserAgent(ua);

  const { error } = await supabase.from("analytics_events").insert({
    profile_id: profileId,
    block_id: blockId,
    event_type: eventType,
    visitor_id: visitorId,
    device_type: deviceType,
    browser,
    os,
  });

  if (error) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
