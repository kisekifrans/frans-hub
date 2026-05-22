import { NextResponse } from "next/server";
import { getProfileForUser } from "@/lib/auth/profile";
import { needsSlugOnboarding } from "@/lib/auth/slug-onboarding";
import { isSiteAdmin } from "@/lib/auth/site-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const profile = await getProfileForUser(supabase, user.id);
    const siteAdmin = await isSiteAdmin(supabase, user.id, user.email);
    const needsUsernameOnboarding = profile
      ? !siteAdmin &&
        needsSlugOnboarding(profile.slug, profile.slug_changed_at)
      : false;

    return NextResponse.json({
      authenticated: true,
      needsUsernameOnboarding,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile: profile
        ? {
            id: profile.id,
            slug: profile.slug,
            username: profile.username,
            displayName: profile.display_name,
            slugChangedAt: profile.slug_changed_at ?? null,
          }
        : null,
      isSiteAdmin: siteAdmin,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Session error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
