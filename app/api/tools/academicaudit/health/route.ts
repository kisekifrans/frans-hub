import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.ACADEMIC_AUDIT_API_URL?.replace(/\/$/, "");
  if (!url) {
    return NextResponse.json({
      ok: false,
      message: "ACADEMIC_AUDIT_API_URL belum diatur di .env.local / Vercel",
    });
  }

  try {
    const res = await fetch(`${url}/health`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({
      ok: res.ok,
      apiUrl: url,
      backend: data,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      apiUrl: url,
      message:
        "Tidak bisa terhubung ke API. Pastikan backend berjalan (localhost:8000 atau URL deploy).",
    });
  }
}
