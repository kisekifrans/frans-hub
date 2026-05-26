"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/components/providers/SessionProvider";

/** Redirects members who have not claimed a username yet. */
export function UsernameOnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  const inOnboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (inOnboarding || session.loading) return;
    if (session.needsUsernameOnboarding) {
      router.replace("/onboarding/username");
    }
  }, [inOnboarding, session.loading, session.needsUsernameOnboarding, router]);

  if (inOnboarding) return <>{children}</>;
  if (session.loading) return null;
  if (session.needsUsernameOnboarding) return null;
  return <>{children}</>;
}
