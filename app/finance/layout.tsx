import { FinanceShell } from "@/components/finance/layout/FinanceShell";
import { UsernameOnboardingGuard } from "@/components/onboarding/UsernameOnboardingGuard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finance · Kawaragi",
  robots: { index: false, follow: false },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UsernameOnboardingGuard>
      <FinanceShell>{children}</FinanceShell>
    </UsernameOnboardingGuard>
  );
}
