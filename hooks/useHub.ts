"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createBlock,
  deleteBlock,
  fetchHub,
  reorderBlocks,
  saveProfile,
  updateBlock,
} from "@/lib/supabase/hub-service";
import type { AnalyticsSnapshot, Profile, ProfileBlock } from "@/lib/types";
import { sortBlocks } from "@/lib/store";
import { generateId } from "@/lib/utils";
import type { BlockType } from "@/lib/types";

function createEmptyBlock(type: BlockType, order: number): ProfileBlock {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : generateId(type);
  const base = { id, type, enabled: true, order };
  switch (type) {
    case "link":
      return { ...base, type: "link", title: "New link", url: "https://" };
    case "gif":
      return { ...base, type: "gif", url: "", caption: "" };
    case "tiktok":
      return {
        ...base,
        type: "tiktok",
        url: "https://www.tiktok.com/@user/video/0",
      };
    case "instagram":
      return {
        ...base,
        type: "instagram",
        url: "https://www.instagram.com/p/example/",
      };
  }
}

export function useHub() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  const getClient = useCallback(() => {
    if (client) return client;
    const c = createClient();
    setClient(c);
    return c;
  }, [client]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      toast.error("Supabase is not configured. Add keys to .env.local");
      return;
    }
    setLoading(true);
    try {
      const supabase = getClient();
      const hub = await fetchHub(supabase, { includeDisabled: true });
      setProfile(hub.profile);
      setProfileId(hub.profileId);
      setAnalytics(hub.analytics);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load hub data");
    } finally {
      setLoading(false);
    }
  }, [getClient]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshAnalytics = useCallback(async () => {
    if (!profileId || !isSupabaseConfigured()) return;
    const { fetchAnalytics } = await import("@/lib/supabase/hub-service");
    const next = await fetchAnalytics(getClient(), profileId);
    setAnalytics(next);
  }, [profileId, getClient]);

  const saveProfileFields = useCallback(
    async (patch: Partial<Profile>) => {
      if (!profile || !profileId) return;
      setSaving(true);
      const prev = profile;
      const next = { ...profile, ...patch };
      setProfile(next);
      try {
        await saveProfile(getClient(), profileId, next);
        toast.success("Profile saved");
      } catch (e) {
        setProfile(prev);
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [profile, profileId, getClient],
  );

  const persistBlocks = useCallback(
    async (blocks: ProfileBlock[], message = "Blocks saved") => {
      if (!profileId || !profile) return;
      setSaving(true);
      const prev = profile;
      const sorted = sortBlocks(blocks).map((b, i) => ({ ...b, order: i }));
      setProfile({ ...profile, blocks: sorted });
      try {
        await reorderBlocks(getClient(), sorted, profileId);
        toast.success(message);
      } catch (e) {
        setProfile(prev);
        toast.error(e instanceof Error ? e.message : "Save failed");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [profile, profileId, getClient],
  );

  const addBlock = useCallback(
    async (type: BlockType) => {
      if (!profile || !profileId) return;
      const order = profile.blocks.length;
      const draft = createEmptyBlock(type, order);
      setSaving(true);
      try {
        const created = await createBlock(getClient(), profileId, draft);
        setProfile({
          ...profile,
          blocks: [...profile.blocks, created],
        });
        toast.success("Block added");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not add block");
      } finally {
        setSaving(false);
      }
    },
    [profile, profileId, getClient],
  );

  const patchBlock = useCallback(
    async (id: string, patch: Partial<ProfileBlock>) => {
      if (!profile || !profileId) return;
      const prev = profile;
      const blocks = profile.blocks.map((b) =>
        b.id === id ? ({ ...b, ...patch } as ProfileBlock) : b,
      );
      const block = blocks.find((b) => b.id === id);
      if (!block) return;
      setProfile({ ...profile, blocks });
      try {
        await updateBlock(getClient(), block, profileId);
      } catch (e) {
        setProfile(prev);
        toast.error(e instanceof Error ? e.message : "Update failed");
      }
    },
    [profile, profileId, getClient],
  );

  const removeBlock = useCallback(
    async (id: string) => {
      if (!profile) return;
      const prev = profile;
      setProfile({
        ...profile,
        blocks: profile.blocks.filter((b) => b.id !== id),
      });
      setSaving(true);
      try {
        await deleteBlock(getClient(), id);
        toast.success("Block removed");
      } catch (e) {
        setProfile(prev);
        toast.error(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setSaving(false);
      }
    },
    [profile, getClient],
  );

  const reorder = useCallback(
    async (blocks: ProfileBlock[]) => {
      await persistBlocks(blocks, "Order updated");
    },
    [persistBlocks],
  );

  return {
    profile,
    profileId,
    analytics,
    loading,
    saving,
    load,
    refreshAnalytics,
    saveProfileFields,
    persistBlocks,
    addBlock,
    patchBlock,
    removeBlock,
    reorder,
  };
}
