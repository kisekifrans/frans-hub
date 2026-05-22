import { NextResponse } from "next/server";
import { getProfileForUser } from "@/lib/auth/profile";
import { isSiteAdmin } from "@/lib/auth/site-admin";
import { createClient } from "@/lib/supabase/server";

/** Legacy verify — prefer GET /api/auth/session */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signOut();
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const profile = await getProfileForUser(supabase, user.id);
  const siteAdmin = await isSiteAdmin(supabase, user.id, user.email);

  return NextResponse.json({
    ok: true,
    email: user.email,
    profile: profile
      ? { id: profile.id, slug: profile.slug }
      : null,
    isSiteAdmin: siteAdmin,
  });
}
