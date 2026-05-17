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
  } catch (e) {
    const message = e instanceof Error ? e.message : "Kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
