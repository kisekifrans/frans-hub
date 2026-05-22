import type { NextRequest } from "next/server";

/** Origin for auth redirects — respects Host header on localhost. */
export function getRequestOrigin(request: NextRequest): string {
  const forced = process.env.NEXT_PUBLIC_DEV_AUTH_ORIGIN?.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development" && forced) {
    return forced;
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return request.nextUrl.origin;
  }

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
