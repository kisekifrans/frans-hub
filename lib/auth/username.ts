import { isReservedSlug, normalizeProfileSlug } from "@/lib/auth/reserved-slugs";

export const USERNAME_MIN_LENGTH = 3;
/** Short public links — e.g. kawaragi.io/frans */
export const USERNAME_MAX_LENGTH = 16;

export type UsernameIssueCode =
  | "ok"
  | "empty"
  | "too_short"
  | "too_long"
  | "invalid_chars"
  | "reserved"
  | "taken"
  | "unchanged";

export type UsernameValidation = {
  normalized: string;
  code: UsernameIssueCode;
  message: string | null;
};

const MESSAGES: Record<Exclude<UsernameIssueCode, "ok">, string> = {
  empty: "Pick a username to continue.",
  too_short: `Use at least ${USERNAME_MIN_LENGTH} characters.`,
  too_long: `Max ${USERNAME_MAX_LENGTH} characters.`,
  invalid_chars:
    "Lowercase letters, numbers, and hyphens only. No spaces or symbols.",
  reserved: "That name is reserved. Try something more unique.",
  taken: "Already taken — try another one.",
  unchanged: "That's already your username.",
};

/** Safe live input: lowercase, allowed chars only, max length. */
export function sanitizeUsernameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

/** Blocks path injection and unsafe characters before DB checks. */
export function validateUsernameFormat(
  raw: string,
): UsernameValidation {
  const normalized = normalizeProfileSlug(raw);

  if (!normalized) {
    return { normalized: "", code: "empty", message: MESSAGES.empty };
  }
  if (normalized.length < USERNAME_MIN_LENGTH) {
    return {
      normalized,
      code: "too_short",
      message: MESSAGES.too_short,
    };
  }
  if (normalized.length > USERNAME_MAX_LENGTH) {
    return {
      normalized,
      code: "too_long",
      message: MESSAGES.too_long,
    };
  }
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return {
      normalized,
      code: "invalid_chars",
      message: MESSAGES.invalid_chars,
    };
  }
  if (normalized.startsWith("-") || normalized.endsWith("-") || /--/.test(normalized)) {
    return {
      normalized,
      code: "invalid_chars",
      message: "Hyphens can't be at the start, end, or doubled.",
    };
  }
  if (isReservedSlug(normalized)) {
    return {
      normalized,
      code: "reserved",
      message: MESSAGES.reserved,
    };
  }

  return { normalized, code: "ok", message: null };
}

export function usernameIssueMessage(code: UsernameIssueCode): string | null {
  if (code === "ok") return null;
  return MESSAGES[code];
}

export function assertValidUsername(raw: string): string {
  const v = validateUsernameFormat(raw);
  if (v.code !== "ok") {
    throw new Error(v.message ?? "Invalid username");
  }
  return v.normalized;
}
