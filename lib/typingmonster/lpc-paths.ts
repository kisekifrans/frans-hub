import type { AssetCatalog, AssetFolder } from "./asset-types";
import { extractAnimationFromPath } from "./animation-names";

const ANIM_TOKENS = [
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

export interface CharacterLayer {
  fileName: string;
  zPos: number;
  layerNum?: number;
  supportedAnimations?: string[];
}

export interface CharacterData {
  layers: CharacterLayer[];
}

/** Replace animation token inside an LPC layer path from character.json. */
export function layerPathForAnimation(
  fileName: string,
  animation: string,
): string {
  for (const token of ANIM_TOKENS) {
    if (fileName.includes(`/${token}.`)) {
      return fileName.replace(`/${token}.`, `/${animation}.`);
    }
    if (fileName.includes(`/${token}/`)) {
      return fileName.replace(`/${token}/`, `/${animation}/`);
    }
  }
  return fileName;
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").toLowerCase();
}

/** Find a layer sheet in scanned standard/custom trees. */
export function findLayerInCatalog(
  catalog: AssetCatalog,
  layerFileName: string,
  animation: string,
): { folder: AssetFolder; relativePath: string; url: string } | null {
  const expected = normalizePath(layerPathForAnimation(layerFileName, animation));

  const tryMatch = (folder: AssetFolder, files: string[]) => {
    for (const rel of files) {
      const n = normalizePath(rel);
      if (n === expected || n.endsWith(`/${expected}`)) {
        return {
          folder,
          relativePath: rel,
          url: `${catalog.basePath}/${folder}/${rel}`,
        };
      }
    }
    return null;
  };

  const customFirst =
    animation === "thrust_oversize" || animation === "walk_128";
  const order: AssetFolder[] = customFirst
    ? ["custom", "standard"]
    : ["standard", "custom"];

  for (const folder of order) {
    const files = folder === "standard" ? catalog.standard : catalog.custom;
    const hit = tryMatch(folder, files);
    if (hit) return hit;
  }

  return null;
}

/** Full composite sheet at `{folder}/{animation}.png` if exported flat. */
export function findCompositeSheet(
  catalog: AssetCatalog,
  animation: string,
): { folder: AssetFolder; url: string } | null {
  const flat = `${animation}.png`;
  const customFirst =
    animation === "thrust_oversize" || animation === "walk_128";
  const order: AssetFolder[] = customFirst
    ? ["custom", "standard"]
    : ["standard", "custom"];

  for (const folder of order) {
    const files = folder === "standard" ? catalog.standard : catalog.custom;
    if (files.some((f) => normalizePath(f) === flat)) {
      return {
        folder,
        url: `${catalog.basePath}/${folder}/${flat}`,
      };
    }
  }
  return null;
}

/** List animation names present in catalog for a given state candidate list. */
export function catalogHasAnimation(
  catalog: AssetCatalog,
  animation: string,
): boolean {
  if (catalog.byAnimation[animation]) return true;
  return [...catalog.standard, ...catalog.custom].some(
    (p) => extractAnimationFromPath(p) === animation,
  );
}
