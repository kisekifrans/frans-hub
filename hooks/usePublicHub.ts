"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchHub, fetchHubBySlug } from "@/lib/supabase/hub-service";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import type { Profile } from "@/lib/types";

export function usePublicHub(slug?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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
        setNotFound(false);
        const client = getClient();
        if (slug) {
          const hub = await fetchHubBySlug(client, slug, {
            requirePublished: true,
          });
          if (!hub) {
            setNotFound(true);
            setProfile(null);
            setProfileId(null);
            return;
          }
          setProfile(hub.profile);
          setProfileId(hub.profileId);
        } else {
          const hub = await fetchHub(client);
          setProfile(hub.profile);
          setProfileId(hub.profileId);
        }
      } catch {
        setProfile(null);
        setProfileId(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [getClient, slug]);

  useEffect(() => {
    if (!profileId || viewedRef.current || !isSupabaseConfigured()) return;
    viewedRef.current = true;
    trackAnalyticsEvent({ profileId, eventType: "view" }).catch(() => {});
  }, [profileId]);

  const trackClick = useCallback(
    (blockId: string) => {
      if (!profileId || !isSupabaseConfigured()) return;
      trackAnalyticsEvent({
        profileId,
        eventType: "click",
        blockId,
      }).catch(() => {});
    },
    [profileId],
  );

  return { profile, profileId, loading, notFound, trackClick };
}
