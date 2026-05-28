import { createHmac, timingSafeEqual, createHash } from "crypto";

export const QA_OUTREACH_COOKIE = "qa_outreach_session";
const SESSION_VERSION = "v1";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** SHA-256("AtlasCapture") — override password via QA_OUTREACH_PASSWORD env */
const DEFAULT_PASSWORD_HASH =
  "44628206275735ddfe1df267e794472690f9b2fa06c9462239e6e161a5c2bf72";

function authSecret(): string {
  const explicit = process.env.QA_OUTREACH_AUTH_SECRET?.trim();
  if (explicit && explicit.length >= 16) return explicit;

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (service && service.length >= 16) return service;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "agisna.dev";
  return createHash("sha256")
    .update(`qa-outreach-session:${site}`)
    .digest("hex");
}

function expectedPasswordHash(): string {
  const plain = process.env.QA_OUTREACH_PASSWORD?.trim();
  // Ignore empty env (Vercel sometimes has QA_OUTREACH_PASSWORD="")
  if (plain && plain.length > 0) {
    return createHash("sha256").update(plain, "utf8").digest("hex");
  }
  return DEFAULT_PASSWORD_HASH;
}

export function verifyQaOutreachPassword(password: string): boolean {
  const attempt = createHash("sha256").update(password, "utf8").digest("hex");
  const expected = expectedPasswordHash();
  try {
    return timingSafeEqual(
      Buffer.from(attempt, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export function createQaOutreachSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${SESSION_VERSION}.${exp}`;
  const sig = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyQaOutreachSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expStr, sig] = parts;
  if (version !== SESSION_VERSION) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const payload = `${version}.${expStr}`;
  const expected = createHmac("sha256", authSecret())
    .update(payload)
    .digest("base64url");

  try {
    return timingSafeEqual(
      Buffer.from(sig, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}

export const qaOutreachCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
