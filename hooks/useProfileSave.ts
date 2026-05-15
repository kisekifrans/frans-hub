"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { saveProfile } from "@/lib/supabase/hub-service";
import type { Profile } from "@/lib/types";

export function useProfileSave(
  profileId: string | null,
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>,
) {
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (current: Profile, patch: Partial<Profile>) => {
      if (!profileId) return;
      const next = { ...current, ...patch };
      setProfile(next);
      setSaving(true);
      try {
        await saveProfile(createClient(), profileId, next);
        toast.success("Profile updated");
      } catch (e) {
        setProfile(current);
        toast.error(e instanceof Error ? e.message : "Could not save profile");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [profileId, setProfile],
  );

  return { save, saving };
}
