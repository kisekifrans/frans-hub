import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/auth/admin";

/**
 * Site-wide admin (gear, edge cases, support). Uses site_admins table when
 * migration 016 is applied; falls back to ADMIN_EMAIL for backward compatibility.
 */
export async function isSiteAdmin(
  supabase: SupabaseClient,
  userId: string | undefined,
  email: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false;
  if (isAdminEmail(email)) return true;

  const { data, error } = await supabase
    .from("site_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Table may not exist before migration 016
    if (error.code === "42P01") return isAdminEmail(email);
    throw error;
  }

  return Boolean(data);
}
