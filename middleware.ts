import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const NON_LOCALIZED = [
  "/admin",
  "/api",
  "/auth",
  "/login",
  "/tools/quickreply",
] as const;

function isNonLocalized(pathname: string): boolean {
  return NON_LOCALIZED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

async function handleAuth(request: NextRequest): Promise<NextResponse> {
  let supabase: ReturnType<typeof createClient>["supabase"];
  let response: ReturnType<typeof createClient>["response"];

  try {
    ({ supabase, response } = createClient(request));
  } catch {
    const pathname = request.nextUrl.pathname;
    if (
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/tools/quickreply" ||
      pathname.startsWith("/tools/quickreply/")
    ) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "config");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedTool =
    pathname === "/tools/quickreply" ||
    pathname.startsWith("/tools/quickreply/");
  const isLoginRoute = pathname === "/login";

  if (isAdminRoute || isProtectedTool) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdminEmail(user.email)) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  if (isLoginRoute && user && isAdminEmail(user.email)) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isNonLocalized(pathname)) {
    return handleAuth(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
