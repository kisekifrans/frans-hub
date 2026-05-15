"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchHub } from "@/lib/supabase/hub-service";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import type { Profile } from "@/lib/types";

export function usePublicHub() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const viewedRef = useRef(false);
  const clientRef = useRef<SupabaseClient | null>(null);

  const getClient = useCallback(() => {
    if (clientRef.current) return clientRef.current;
    clientRef.current = createClient();
    return clientRef.current;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const hub = await fetchHub(getClient());
        setProfile(hub.profile);
        setProfileId(hub.profileId);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [getClient]);

  useEffect(() => {
    if (!profileId || viewedRef.current || !isSupabaseConfigured()) return;
    viewedRef.current = true;
    trackAnalyticsEvent({ profileId, eventType: "view" }).catch(() => {});
  }, [profileId, getClient]);

  const trackClick = useCallback(
    (blockId: string) => {
      if (!profileId || !isSupabaseConfigured()) return;
      trackAnalyticsEvent({
        profileId,
        eventType: "click",
        blockId,
      }).catch(() => {});
    },
    [profileId, getClient],
  );

  return { profile, profileId, loading, trackClick };
}
