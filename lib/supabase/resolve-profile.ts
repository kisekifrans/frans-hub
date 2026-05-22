import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveProfileIdForUser(
  supabase: SupabaseClient,
): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      "No profile linked to this account. Sign in again or contact support.",
    );
  }

  return data.id as string;
}
