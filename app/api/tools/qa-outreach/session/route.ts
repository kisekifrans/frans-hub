import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  QA_OUTREACH_COOKIE,
  verifyQaOutreachSessionToken,
} from "@/lib/tools/qa-outreach-auth";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(QA_OUTREACH_COOKIE)?.value;
  const authenticated = verifyQaOutreachSessionToken(token);
  return NextResponse.json({ authenticated });
}
