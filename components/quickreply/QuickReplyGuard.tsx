"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/auth/admin";

export function QuickReplyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.replace("/login?error=config&next=/tools/quickreply");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isAdminEmail(user.email)) {
        router.replace("/login?next=/tools/quickreply");
      }
    });
  }, [router]);

  return <>{children}</>;
}
