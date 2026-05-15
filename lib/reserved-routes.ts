/** Paths that must not resolve as collection slugs */
export const RESERVED_SLUGS = new Set([
  "admin",
  "login",
  "auth",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
