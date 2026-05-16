import { NextResponse } from "next/server";

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
  try {
    const { sessionId } = await context.params;
    const res = await fetch(`${apiBase()}/api/v1/audit/${sessionId}/download`);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Laporan tidak ditemukan." },
        { status: res.status },
      );
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="laporan-academic-audit.pdf"',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
