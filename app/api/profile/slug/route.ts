import { NextResponse } from "next/server";
import { getProfileForUser } from "@/lib/auth/profile";
import {
  checkSlugAvailability,
  updateProfileSlug,
} from "@/lib/supabase/profile-slug";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("slug") ?? "";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileForUser(supabase, user.id);
    const result = await checkSlugAvailability(
      supabase,
      raw,
      profile?.id,
    );

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Check failed";
    return NextResponse.json(
      { available: false, code: "invalid_chars", message },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const slug = body.slug as string | undefined;
    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "Username is required", code: "empty" },
        { status: 400 },
      );
    }

    const result = await updateProfileSlug(supabase, user.id, slug);
    return NextResponse.json({
      ok: true,
      slug: result.slug,
      publicUrl: `/${result.slug}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
