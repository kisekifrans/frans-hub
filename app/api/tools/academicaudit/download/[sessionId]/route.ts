import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { isSiteAdmin } from "@/lib/auth/site-admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function apiBase(): string {
  const url = process.env.ACADEMIC_AUDIT_API_URL?.replace(/\/$/, "");
  if (!url) throw new Error("ACADEMIC_AUDIT_API_URL belum dikonfigurasi.");
  return url;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  const { sessionId } = await context.params;
  if (!sessionId || sessionId.length > 200) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const supabase = await createClient();
  const [{ data: owned }, admin] = await Promise.all([
    supabase
      .from("academicaudit_sessions")
      .select("user_id")
      .eq("session_id", sessionId)
      .maybeSingle(),
    isSiteAdmin(supabase, user.id, user.email),
  ]);

  const isOwner =
    !!owned && (owned as { user_id: string }).user_id === user.id;
  if (!isOwner && !admin) {
    return NextResponse.json(
      { error: "Laporan tidak ditemukan." },
      { status: 404 },
    );
  }

  try {
    const res = await fetch(`${apiBase()}/api/v1/audit/${sessionId}/download`);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Laporan tidak ditemukan." },
        { status: res.status },
      );
    }

    const buffer = await res.arrayBuffer();
    const upstreamDisposition = res.headers.get("Content-Disposition");
    const disposition =
      upstreamDisposition ??
      'attachment; filename="dokumen_audit-report.pdf"';

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Kesalahan server." },
      { status: 500 },
    );
  }
}
