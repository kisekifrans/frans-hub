"use client";

import dynamic from "next/dynamic";

const AcademicAuditApp = dynamic(
  () =>
    import("@/components/academicaudit/AcademicAuditApp").then(
      (m) => m.AcademicAuditApp,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        Memuat AI Academic Audit…
      </div>
    ),
  },
);

export function AcademicAuditPageClient() {
  return <AcademicAuditApp />;
}
