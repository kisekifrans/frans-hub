"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function ApiStatusBanner() {
  const [status, setStatus] = useState<
    "loading" | "ok" | "missing" | "down"
  >("loading");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    fetch("/api/tools/academicaudit/health")
      .then((r) => r.json())
      .then((data: { ok?: boolean; message?: string; apiUrl?: string }) => {
        if (!data.apiUrl && data.message?.includes("belum")) {
          setStatus("missing");
          setDetail(data.message ?? "");
          return;
        }
        if (data.ok) {
          setStatus("ok");
          setDetail(data.apiUrl ?? "");
          return;
        }
        setStatus("down");
        setDetail(data.message ?? "API tidak merespons");
      })
      .catch(() => {
        setStatus("down");
        setDetail("Gagal memeriksa koneksi API");
      });
  }, []);

  if (status === "loading") {
    return (
      <GlassCard padding="sm" className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Memeriksa koneksi backend…
      </GlassCard>
    );
  }

  if (status === "ok") {
    return (
      <GlassCard
        padding="sm"
        className="mb-4 flex items-center gap-2 border-emerald-400/30 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-300"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Backend terhubung ({detail}). Siap menganalisis dokumen.
        </span>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      padding="md"
      className="mb-4 border-amber-400/40 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-100"
    >
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-2">
          <p className="font-semibold">
            {status === "missing"
              ? "Backend belum dikonfigurasi"
              : "Backend tidak berjalan"}
          </p>
          <p className="leading-relaxed opacity-90">{detail}</p>
          <ol className="list-decimal space-y-1 pl-4 opacity-90">
            <li>
              Install Python 3.11+, lalu di folder{" "}
              <code className="rounded bg-black/10 px-1">services/academicaudit-api</code>{" "}
              jalankan: <code className="rounded bg-black/10 px-1">.\start-local.ps1</code>
            </li>
            <li>
              Isi <code className="rounded bg-black/10 px-1">OPENAI_API_KEY</code> di{" "}
              <code className="rounded bg-black/10 px-1">services/academicaudit-api/.env</code>
            </li>
            <li>
              Pastikan <code className="rounded bg-black/10 px-1">ACADEMIC_AUDIT_API_URL=http://localhost:8000</code>{" "}
              ada di <code className="rounded bg-black/10 px-1">frans-hub/.env.local</code>
            </li>
            <li>Restart <code className="rounded bg-black/10 px-1">npm run dev</code></li>
          </ol>
        </div>
      </div>
    </GlassCard>
  );
}
