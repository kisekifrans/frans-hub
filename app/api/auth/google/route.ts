import { NextResponse, type NextRequest } from "next/server";
import { buildOAuthCallbackUrl } from "@/lib/auth/oauth-redirect";
import { getRequestOrigin } from "@/lib/auth/request-origin";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

/**
 * Starts Google OAuth on the server so redirectTo uses the real Host
 * (e.g. http://localhost:3000), not Supabase Site URL fallback.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const origin = getRequestOrigin(request);
  const redirectTo = buildOAuthCallbackUrl(origin, next);

  const cookieResponse = NextResponse.next();
  const supabase = createRouteHandlerClient(request, cookieResponse);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const redirectResponse = NextResponse.redirect(data.url);
  cookieResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
