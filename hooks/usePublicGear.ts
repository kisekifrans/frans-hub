"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchGearPage,
  fetchGearPageBySlug,
} from "@/lib/supabase/gear-service";
import type { GearPageData } from "@/lib/gear/types";

/**
 * Public gear loader.
 *
 * When `slug` is provided, loads that creator's gear (and treats a missing /
 * opted-out profile as a "not found" state). Otherwise falls back to the
 * site marketing profile so the existing `/gear` route keeps working.
 */
export function usePublicGear(slug?: string) {
  const [data, setData] = useState<GearPageData | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const supabase = createClient();
      const page = slug
        ? await fetchGearPageBySlug(supabase, slug)
        : await fetchGearPage(supabase);
      if (!page) {
        setNotFound(true);
        setData(null);
        setProfileId(null);
        return;
      }
      setProfileId(page.profileId);
      setData({
        profile: page.profile,
        settings: page.settings,
        categories: page.categories,
        items: page.items,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load gear.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, profileId, loading, error, notFound, reload: load };
}
