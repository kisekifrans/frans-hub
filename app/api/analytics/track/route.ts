import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseUserAgent } from "@/lib/parse-user-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileId = body.profileId as string | undefined;
    const eventType = body.eventType as "view" | "click" | undefined;
    const blockId = body.blockId as string | undefined;
    const visitorId = body.visitorId as string | undefined;

    if (!profileId || !eventType || !["view", "click"].includes(eventType)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const ua = request.headers.get("user-agent");
    const { deviceType, browser, os } = parseUserAgent(ua);

    const supabase = await createClient();
    const { error } = await supabase.from("analytics_events").insert({
      profile_id: profileId,
      block_id: blockId ?? null,
      event_type: eventType,
      visitor_id: visitorId?.slice(0, 128) ?? null,
      device_type: deviceType,
      browser,
      os,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
