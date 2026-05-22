"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Redirects members who have not claimed a username yet. */
export function UsernameOnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/onboarding")) {
      setReady(true);
      return;
    }

    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: { needsUsernameOnboarding?: boolean } | null) => {
          if (data?.needsUsernameOnboarding) {
            router.replace("/onboarding/username");
            return;
          }
          setReady(true);
        },
      )
      .catch(() => setReady(true));
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
