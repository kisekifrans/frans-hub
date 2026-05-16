import { AcademicAuditPageClient } from "@/components/academicaudit/AcademicAuditPageClient";

export const metadata = {
  title: "AI Academic Audit | Analisis Pola Tulisan",
  description:
    "Analisis pola tulisan akademik Bahasa Indonesia dari dokumen PDF. Indikator probabilistik, bukan deteksi AI pasti.",
};

export default function AcademicAuditPage() {
  return <AcademicAuditPageClient />;
}
