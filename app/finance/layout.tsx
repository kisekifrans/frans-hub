import { FinanceShell } from "@/components/finance/layout/FinanceShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finance · agisna.dev",
  robots: { index: false, follow: false },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinanceShell>{children}</FinanceShell>;
}
