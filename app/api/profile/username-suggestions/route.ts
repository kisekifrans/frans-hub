import { NextResponse } from "next/server";
import { generateUsernameCandidates } from "@/lib/auth/username-suggestions";
import { getProfileForUser } from "@/lib/auth/profile";
import { checkSlugAvailability } from "@/lib/supabase/profile-slug";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileForUser(supabase, user.id);
    const candidates = generateUsernameCandidates({
      email: user.email,
      displayName: profile?.display_name,
      username: profile?.username,
      currentSlug: profile?.slug,
    });

    const suggestions: { slug: string; available: boolean }[] = [];
    for (const slug of candidates) {
      const result = await checkSlugAvailability(
        supabase,
        slug,
        profile?.id,
      );
      suggestions.push({
        slug: result.slug,
        available: result.available && result.code === "ok",
      });
      if (suggestions.filter((s) => s.available).length >= 4) break;
    }

    return NextResponse.json({ suggestions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
