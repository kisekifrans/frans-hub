import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

function apiBase(): string {
  const url = process.env.ACADEMIC_AUDIT_API_URL?.replace(/\/$/, "");
  if (!url) {
    throw new Error("ACADEMIC_AUDIT_API_URL belum dikonfigurasi.");
  }
  return url;
}

function extractSessionId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const candidate =
    obj.session_id ?? obj.sessionId ?? obj.id ?? obj.audit_session_id;
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : null;
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

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

    for (const key of [
      "exclude_toc",
      "exclude_bibliography",
      "exclude_appendix",
      "exclude_captions",
      "exclude_pages",
    ] as const) {
      const val = form.get(key);
      if (val != null && String(val).trim() !== "") {
        upstream.append(key, String(val));
      }
    }

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

    const sessionId = extractSessionId(data);
    if (sessionId) {
      const supabase = await createClient();
      await supabase
        .from("academicaudit_sessions")
        .upsert(
          { session_id: sessionId, user_id: user.id },
          { onConflict: "session_id" },
        );
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
