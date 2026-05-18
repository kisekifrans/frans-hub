import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  isAdminPath,
  isBareAdminPath,
  isLocalizedAdminPath,
  localeFromLocalizedAdminPath,
} from "@/lib/i18n/paths";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const NON_LOCALIZED = [
  "/api",
  "/auth",
  "/login",
  "/tools/quickreply",
  "/finance",
] as const;

function isNonLocalized(pathname: string): boolean {
  return NON_LOCALIZED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isProtectedToolPath(pathname: string): boolean {
  return (
    pathname === "/tools/quickreply" ||
    pathname.startsWith("/tools/quickreply/")
  );
}

function mergeCookies(from: NextResponse, into: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    into.cookies.set(cookie.name, cookie.value, cookie);
  });
  return into;
}

async function handleAuth(request: NextRequest): Promise<NextResponse> {
  let supabase: ReturnType<typeof createClient>["supabase"];
  let response: ReturnType<typeof createClient>["response"];

  try {
    ({ supabase, response } = createClient(request));
  } catch {
    const pathname = request.nextUrl.pathname;
    if (isAdminPath(pathname) || isProtectedToolPath(pathname)) {
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
  const isAdminRoute = isAdminPath(pathname);
  const isProtectedTool = isProtectedToolPath(pathname);
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
    const locale = localeFromLocalizedAdminPath(
      request.nextUrl.searchParams.get("next") ?? "",
    );
    adminUrl.pathname = locale ? `/${locale}/admin` : "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isBareAdminPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/id${pathname}`;
    return NextResponse.redirect(url);
  }

  const needsAuth =
    isAdminPath(pathname) ||
    isProtectedToolPath(pathname) ||
    pathname === "/login";

  let authResponse: NextResponse | null = null;
  if (needsAuth) {
    authResponse = await handleAuth(request);
    if (authResponse.headers.get("location")) {
      return authResponse;
    }
  }

  if (isNonLocalized(pathname)) {
    return authResponse ?? NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);
  return authResponse ? mergeCookies(authResponse, intlResponse) : intlResponse;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
