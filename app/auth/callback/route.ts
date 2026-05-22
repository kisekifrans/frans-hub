import { NextResponse, type NextRequest } from "next/server";
import { ensureUserProfile } from "@/lib/auth/bootstrap-profile";
import { getRequestOrigin } from "@/lib/auth/request-origin";
import { resolvePostLoginPath } from "@/lib/auth/session-redirect";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const cookieResponse = NextResponse.next();
  const supabase = createRouteHandlerClient(request, cookieResponse);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  await ensureUserProfile(supabase, user).catch(() => {});

  const dest = await resolvePostLoginPath(
    supabase,
    user.id,
    user.email,
    next,
  );

  const redirectResponse = NextResponse.redirect(`${origin}${dest}`);
  cookieResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}
