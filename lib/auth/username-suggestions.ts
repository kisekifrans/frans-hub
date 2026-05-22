import { isValidProfileSlug, normalizeProfileSlug } from "@/lib/auth/reserved-slugs";
import { sanitizeUsernameInput, USERNAME_MIN_LENGTH } from "@/lib/auth/username";

export type UsernameSuggestionSource = {
  email?: string | null;
  displayName?: string | null;
  username?: string | null;
  currentSlug?: string | null;
};

function splitEmailLocal(email: string): string[] {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return local
    .split(/[._+-]+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ""))
    .filter((p) => p.length >= 2);
}

function splitDisplayName(displayName: string): string[] {
  return displayName
    .toLowerCase()
    .split(/[\s|·•,]+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ""))
    .filter((p) => p.length >= USERNAME_MIN_LENGTH);
}

/** Personal candidates from email + name — no random suffixes or smashed words. */
export function generateUsernameCandidates(
  source: UsernameSuggestionSource,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (raw: string | undefined | null) => {
    if (!raw) return;
    const s = sanitizeUsernameInput(raw);
    if (s.length < USERNAME_MIN_LENGTH) return;
    if (!isValidProfileSlug(s)) return;
    if (seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };

  if (source.email) {
    const local = source.email.split("@")[0] ?? "";
    add(local.replace(/[._+-]/g, ""));
    add(local.replace(/[._+]/g, "-").replace(/--+/g, "-"));

    const emailParts = splitEmailLocal(source.email);
    if (emailParts[0]) add(emailParts[0]);
    if (emailParts.length >= 2) {
      add(`${emailParts[0]}-${emailParts[1]}`);
      const compact = `${emailParts[0]}${emailParts[1].charAt(0)}`;
      if (compact.length >= USERNAME_MIN_LENGTH) add(compact);
    }
  }

  const nameParts = splitDisplayName(source.displayName ?? "");
  if (nameParts[0]) add(nameParts[0]);
  if (nameParts.length >= 2) {
    add(`${nameParts[0]}-${nameParts[1]}`);
    const withInitial = `${nameParts[0]}${nameParts[nameParts.length - 1].charAt(0)}`;
    if (withInitial.length >= USERNAME_MIN_LENGTH) add(withInitial);
  }

  if (source.username) {
    add(source.username.replace(/[^a-z0-9]/g, ""));
  }

  const current = source.currentSlug
    ? normalizeProfileSlug(source.currentSlug)
    : "";
  if (current && current !== "main") {
    add(current.replace(/\d+$/, ""));
  }

  return out.slice(0, 8);
}
