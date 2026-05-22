import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth/bootstrap-profile";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(supabase, user);
    return NextResponse.json({
      ok: true,
      profileId: profile.id,
      slug: profile.slug,
      created: profile.created,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bootstrap failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
