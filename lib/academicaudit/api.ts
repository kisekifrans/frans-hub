import type { AuditResponse } from "./types";

export async function submitAudit(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<AuditResponse> {
  const form = new FormData();
  form.append("file", file);

  onProgress?.(15);

  const res = await fetch("/api/tools/academicaudit/audit", {
    method: "POST",
    body: form,
  });

  onProgress?.(90);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || "Gagal menganalisis dokumen.",
    );
  }

  onProgress?.(100);
  return res.json() as Promise<AuditResponse>;
}

export function downloadReportUrl(sessionId: string): string {
  return `/api/tools/academicaudit/download/${sessionId}`;
}
