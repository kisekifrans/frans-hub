/** Known LPC animation tokens (longest first for matching). */
export const LPC_ANIMATION_NAMES = [
  "thrust_oversize",
  "walk_128",
  "combat_idle",
  "1h_halfslash",
  "1h_backslash",
  "1h_slash",
  "spellcast",
  "thrust",
  "watering",
  "combat",
  "slash",
  "shoot",
  "climb",
  "emote",
  "hurt",
  "idle",
  "jump",
  "walk",
  "sit",
  "run",
] as const;

export type LpcAnimationName = (typeof LPC_ANIMATION_NAMES)[number];

const NAME_SET = new Set<string>(LPC_ANIMATION_NAMES);

export function isKnownAnimation(name: string): boolean {
  return NAME_SET.has(name.toLowerCase());
}

/**
 * Extract animation name from a nested LPC export path.
 * e.g. `body/bodies/female/idle.png` → `idle`
 */
export function extractAnimationFromPath(relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, "/").toLowerCase();
  const withoutExt = normalized.replace(/\.png$/i, "");
  const segments = withoutExt.split("/").filter(Boolean);

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (NAME_SET.has(seg)) return seg;
  }

  for (const name of LPC_ANIMATION_NAMES) {
    if (normalized.includes(`/${name}.`) || normalized.includes(`/${name}/`)) {
      return name;
    }
  }

  return null;
}

/** Pick the first candidate that exists in the catalog. */
export function resolveAnimationFromCatalog(
  candidates: readonly string[],
  catalogAnimations: Set<string>,
): string | null {
  for (const c of candidates) {
    if (catalogAnimations.has(c)) return c;
  }
  for (const c of candidates) {
    const fuzzy = [...catalogAnimations].find(
      (a) => a.includes(c) || c.includes(a),
    );
    if (fuzzy) return fuzzy;
  }
  return null;
}
