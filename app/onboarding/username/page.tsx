import { UsernameOnboardingPage } from "@/components/onboarding/UsernameOnboardingPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Choose your link · Kawaragi",
  robots: { index: false, follow: false },
};

export default function OnboardingUsernameRoute() {
  return <UsernameOnboardingPage />;
}
