import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true, email: user.email });
}
