/** OAuth callback URL — must match Supabase Dashboard → Auth → Redirect URLs */
export function buildOAuthCallbackUrl(origin: string, nextPath: string): string {
  const base = origin.replace(/\/$/, "");
  const next =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
