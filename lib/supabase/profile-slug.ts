import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validateUsernameFormat,
  type UsernameIssueCode,
} from "@/lib/auth/username";
import { normalizeProfileSlug } from "@/lib/auth/reserved-slugs";

export type SlugAvailabilityResult = {
  slug: string;
  available: boolean;
  code: UsernameIssueCode;
  message: string | null;
};

export async function checkSlugAvailability(
  supabase: SupabaseClient,
  rawSlug: string,
  excludeProfileId?: string,
): Promise<SlugAvailabilityResult> {
  const format = validateUsernameFormat(rawSlug);
  if (format.code !== "ok") {
    return {
      slug: format.normalized,
      available: false,
      code: format.code,
      message: format.message,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", format.normalized)
    .maybeSingle();

  if (error) throw error;

  if (data?.id && data.id !== excludeProfileId) {
    return {
      slug: format.normalized,
      available: false,
      code: "taken",
      message: "Already taken — try another one.",
    };
  }

  if (data?.id && data.id === excludeProfileId) {
    return {
      slug: format.normalized,
      available: true,
      code: "unchanged",
      message: null,
    };
  }

  return {
    slug: format.normalized,
    available: true,
    code: "ok",
    message: null,
  };
}

export async function updateProfileSlug(
  supabase: SupabaseClient,
  userId: string,
  rawSlug: string,
): Promise<{ slug: string; profileId: string }> {
  const check = validateUsernameFormat(rawSlug);
  if (check.code !== "ok") {
    throw new Error(check.message ?? "Invalid username");
  }

  const { data: owned, error: ownedError } = await supabase
    .from("profiles")
    .select("id, slug")
    .eq("user_id", userId)
    .maybeSingle();

  if (ownedError) throw ownedError;
  if (!owned) throw new Error("No profile found for this account.");

  const availability = await checkSlugAvailability(
    supabase,
    check.normalized,
    owned.id as string,
  );
  if (!availability.available) {
    throw new Error(availability.message ?? "Username not available");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      slug: check.normalized,
      slug_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", owned.id);

  if (updateError) throw updateError;

  return { slug: check.normalized, profileId: owned.id as string };
}
