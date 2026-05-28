import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { isSiteAdmin } from "@/lib/auth/site-admin";
import {
  isLocalizedLoginPath,
  isLoginPath,
  isMemberPath,
  slugFromLocalizedPublicPath,
  isPublicSlugPath,
  isSiteAdminPath,
  localeFromLocalizedAdminPath,
  slugFromPublicPath,
} from "@/lib/i18n/paths";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const NON_LOCALIZED = [
  "/api",
  "/auth",
  "/login",
  "/onboarding",
  "/tools/quickreply",
  "/finance",
  "/dashboard",
] as const;

function isNonLocalized(pathname: string): boolean {
  if (NON_LOCALIZED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith("/hub/")) return true;
  return isPublicSlugPath(pathname);
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

function safeRedirectPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

async function handleAuth(request: NextRequest): Promise<NextResponse> {
  let supabase: ReturnType<typeof createClient>["supabase"];
  let response: ReturnType<typeof createClient>["response"];

  try {
    ({ supabase, response } = createClient(request));
  } catch {
    const pathname = request.nextUrl.pathname;
    if (
      isSiteAdminPath(pathname) ||
      isMemberPath(pathname) ||
      isProtectedToolPath(pathname)
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
  const siteAdminRoute = isSiteAdminPath(pathname);
  const memberRoute = isMemberPath(pathname);
  const protectedTool = isProtectedToolPath(pathname);
  const isLoginRoute = isLoginPath(pathname);

  if (siteAdminRoute || memberRoute || protectedTool) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (siteAdminRoute || protectedTool) {
      const admin = await isSiteAdmin(supabase, user.id, user.email);
      if (!admin) {
        await supabase.auth.signOut();
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }
    }

    return response;
  }

  if (isLoginRoute && user) {
    const admin = await isSiteAdmin(supabase, user.id, user.email);
    const next = request.nextUrl.searchParams.get("next");
    const dest = request.nextUrl.clone();
    dest.search = "";

    if (admin && (next?.includes("/admin") || !next)) {
      const locale = localeFromLocalizedAdminPath(next ?? "");
      dest.pathname = locale ? `/${locale}/admin` : "/id/admin";
    } else {
      dest.pathname = safeRedirectPath(next, "/dashboard");
    }
    return NextResponse.redirect(dest);
  }

  return response;
}

/** Supabase OAuth errors on / or /en — send to login with a clear message. */
function redirectAuthErrorsToLogin(request: NextRequest): NextResponse | null {
  const oauthError = request.nextUrl.searchParams.get("error");
  if (!oauthError) return null;
  if (isLoginPath(request.nextUrl.pathname)) return null;

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  const code = request.nextUrl.searchParams.get("error_code");
  loginUrl.searchParams.set(
    "error",
    code === "flow_state_already_used" ? "auth_reused" : "auth",
  );
  return NextResponse.redirect(loginUrl);
}

/** Supabase sometimes returns ?code= on /en instead of /auth/callback — forward it. */
function redirectOAuthCodeToCallback(request: NextRequest): NextResponse | null {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return null;

  const pathname = request.nextUrl.pathname;
  if (pathname === "/auth/callback" || pathname.startsWith("/auth/callback/")) {
    return null;
  }

  const dest = request.nextUrl.clone();
  dest.pathname = "/auth/callback";
  return NextResponse.redirect(dest);
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const authErrorRedirect = redirectAuthErrorsToLogin(request);
  if (authErrorRedirect) return authErrorRedirect;

  const oauthRedirect = redirectOAuthCodeToCallback(request);
  if (oauthRedirect) return oauthRedirect;

  if (isLocalizedLoginPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const publicSlug = slugFromPublicPath(pathname);
  if (publicSlug) {
    const url = request.nextUrl.clone();
    url.pathname = `/hub/${publicSlug}`;
    return NextResponse.rewrite(url);
  }

  const localizedPublicSlug = slugFromLocalizedPublicPath(pathname);
  if (localizedPublicSlug) {
    const url = request.nextUrl.clone();
    url.pathname = `/hub/${localizedPublicSlug}`;
    return NextResponse.rewrite(url);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/id${pathname}`;
    return NextResponse.redirect(url);
  }

  const needsAuth =
    isSiteAdminPath(pathname) ||
    isMemberPath(pathname) ||
    isProtectedToolPath(pathname) ||
    isLoginPath(pathname);

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
