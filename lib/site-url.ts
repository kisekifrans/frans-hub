/**
 * Resolve the canonical site host/origin without causing hydration mismatches.
 *
 * Rules:
 *   - During SSR and the *first* client render we always return the static
 *     fallback (NEXT_PUBLIC_SITE_URL, otherwise a generic placeholder).
 *     Both bundles must agree, otherwise React warns and we leak the wrong
 *     brand into the DOM.
 *   - Components that want the *real* window.location.host should read it
 *     inside `useEffect` and store it in state.
 */

const FALLBACK_HOST = "agisna.dev";

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function staticSiteHost(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return stripProtocol(env);
  return FALLBACK_HOST;
}

export function staticSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return `https://${FALLBACK_HOST}`;
}
