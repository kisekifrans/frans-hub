"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const AcademicAuditApp = dynamic(
  () =>
    import("@/components/academicaudit/AcademicAuditApp").then(
      (m) => m.AcademicAuditApp,
    ),
  {
    ssr: false,
    loading: () => <AcademicAuditLoading />,
  },
);

function AcademicAuditLoading() {
  const t = useTranslations("academicaudit");
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
      {t("loading")}
    </div>
  );
}

export function AcademicAuditPageClient() {
  return <AcademicAuditApp />;
}
