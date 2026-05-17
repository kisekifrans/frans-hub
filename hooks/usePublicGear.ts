"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchGearPage } from "@/lib/supabase/gear-service";
import type { GearPageData } from "@/lib/gear/types";

export function usePublicGear() {
  const [data, setData] = useState<GearPageData | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const page = await fetchGearPage(supabase);
      setProfileId(page.profileId);
      setData({
        profile: page.profile,
        settings: page.settings,
        categories: page.categories,
        items: page.items,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat gear.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, profileId, loading, error, reload: load };
}
