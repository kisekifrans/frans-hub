import type { AuditResponse, ExclusionOptions } from "./types";

export async function submitAudit(
  file: File,
  exclusions: ExclusionOptions,
  onProgress?: (pct: number) => void,
): Promise<AuditResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("exclude_toc", exclusions.excludeToc ? "true" : "false");
  form.append(
    "exclude_bibliography",
    exclusions.excludeBibliography ? "true" : "false",
  );
  form.append("exclude_appendix", exclusions.excludeAppendix ? "true" : "false");
  form.append("exclude_captions", exclusions.excludeCaptions ? "true" : "false");
  if (exclusions.excludePages.trim()) {
    form.append("exclude_pages", exclusions.excludePages.trim());
  }

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
