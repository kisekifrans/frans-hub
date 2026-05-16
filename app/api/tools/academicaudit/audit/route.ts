import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

function apiBase(): string {
  const url = process.env.ACADEMIC_AUDIT_API_URL?.replace(/\/$/, "");
  if (!url) {
    throw new Error("ACADEMIC_AUDIT_API_URL belum dikonfigurasi.");
  }
  return url;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File PDF wajib diunggah." },
        { status: 400 },
      );
    }

    const upstream = new FormData();
    upstream.append("file", file);

    const res = await fetch(`${apiBase()}/api/v1/audit`, {
      method: "POST",
      body: upstream,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      let message = "Analisis gagal.";
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === "string") message = detail;
      else if (Array.isArray(detail) && detail[0]) {
        const first = detail[0] as { msg?: string };
        message = first.msg ?? message;
      }
      return NextResponse.json({ error: message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (e) {
    const raw = e instanceof Error ? e.message : "";
    const message =
      raw.includes("fetch failed") || raw.includes("ECONNREFUSED")
        ? "Backend tidak berjalan. Jalankan API Python di localhost:8000 (lihat services/academicaudit-api/start-local.ps1)."
        : raw || "Kesalahan server.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
