import { UsernameOnboardingGuard } from "@/components/onboarding/UsernameOnboardingGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UsernameOnboardingGuard>{children}</UsernameOnboardingGuard>;
}
