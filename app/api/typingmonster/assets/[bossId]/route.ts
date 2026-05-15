import { NextResponse } from "next/server";
import { scanBossAssets } from "@/lib/typingmonster/scan-assets";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ bossId: string }> },
) {
  const { bossId } = await context.params;
  if (!/^[a-z0-9_-]+$/i.test(bossId)) {
    return NextResponse.json({ error: "Invalid boss id" }, { status: 400 });
  }

  const catalog = scanBossAssets(bossId);
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
