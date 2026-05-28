import { NextResponse } from "next/server";
import {
  QA_OUTREACH_COOKIE,
  createQaOutreachSessionToken,
  qaOutreachCookieOptions,
  verifyQaOutreachPassword,
} from "@/lib/tools/qa-outreach-auth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = body.password?.trim();
  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  if (!verifyQaOutreachPassword(password)) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  try {
    const token = createQaOutreachSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(QA_OUTREACH_COOKIE, token, qaOutreachCookieOptions);
    return res;
  } catch {
    return NextResponse.json(
      { error: "Session could not be created" },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(QA_OUTREACH_COOKIE, "", {
    ...qaOutreachCookieOptions,
    maxAge: 0,
  });
  return res;
}
