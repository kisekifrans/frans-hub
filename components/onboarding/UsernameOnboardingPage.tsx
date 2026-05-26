"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/components/providers/SessionProvider";
import { UsernamePicker } from "@/components/onboarding/UsernamePicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageShell } from "@/components/ui/PageShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUsernamePicker } from "@/hooks/useUsernamePicker";
import { needsSlugOnboarding } from "@/lib/auth/slug-onboarding";
import { sanitizeUsernameInput } from "@/lib/auth/username";

export function UsernameOnboardingPage() {
  const router = useRouter();
  const session = useSession();
  const [initial, setInitial] = useState("");

  useEffect(() => {
    if (session.loading) return;
    if (!session.authenticated || !session.profile) {
      router.replace("/login?next=/onboarding/username");
      return;
    }
    const p = session.profile;
    if (
      !session.needsUsernameOnboarding &&
      !needsSlugOnboarding(p.slug, p.slugChangedAt)
    ) {
      router.replace("/dashboard");
      return;
    }
    const base = p.slug.replace(/\d+$/, "") || "";
    setInitial(sanitizeUsernameInput(base));
  }, [
    session.loading,
    session.authenticated,
    session.profile,
    session.needsUsernameOnboarding,
    router,
  ]);

  const picker = useUsernamePicker({ initialUsername: initial });

  useEffect(() => {
    if (initial) picker.setUsername(initial);
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  if (session.loading) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  return (
    <PageShell variant="violet" contentClassName="flex min-h-screen flex-col">
      <header className="flex justify-end p-4 sm:p-6">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-4">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <GlassCard padding="lg" className="shadow-xl shadow-violet-500/10">
            <UsernamePicker
              picker={picker}
              onSuccess={() => router.replace("/dashboard")}
            />
          </GlassCard>
        </motion.div>
      </main>
    </PageShell>
  );
}
