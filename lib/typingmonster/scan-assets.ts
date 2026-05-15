import fs from "fs";
import path from "path";
import { extractAnimationFromPath } from "./animation-names";
import type { AssetCatalog, AssetFolder } from "./asset-types";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

function walkPngFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const stack: string[] = [dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.name.toLowerCase().endsWith(".png")) {
        results.push(full);
      }
    }
  }
  return results;
}

function toRelativePaths(absFiles: string[], folderRoot: string): string[] {
  return absFiles
    .map((abs) => path.relative(folderRoot, abs).replace(/\\/g, "/"))
    .sort();
}

function readMetadata(bossDir: string): {
  frameSize: number;
  exportedStandard?: string[];
  exportedCustom?: string[];
} {
  const metaPath = path.join(bossDir, "credits", "metadata.json");
  if (!fs.existsSync(metaPath)) {
    return { frameSize: 64 };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
      frameSize?: number;
      standardAnimations?: { exported?: string[] };
      customAnimations?: { exported?: string[] };
    };
    return {
      frameSize: raw.frameSize ?? 64,
      exportedStandard: raw.standardAnimations?.exported,
      exportedCustom: raw.customAnimations?.exported,
    };
  } catch {
    return { frameSize: 64 };
  }
}

function groupByAnimation(
  standard: string[],
  custom: string[],
): AssetCatalog["byAnimation"] {
  const byAnimation: AssetCatalog["byAnimation"] = {};

  const add = (folder: AssetFolder, rel: string) => {
    const anim = extractAnimationFromPath(rel);
    if (!anim) return;
    if (!byAnimation[anim]) byAnimation[anim] = {};
    if (!byAnimation[anim]![folder]) byAnimation[anim]![folder] = [];
    byAnimation[anim]![folder]!.push(rel);
  };

  for (const rel of standard) add("standard", rel);
  for (const rel of custom) add("custom", rel);

  return byAnimation;
}

/**
 * Scan `standard/` and `custom/` under a boss export directory.
 */
export function scanBossAssets(bossId: string): AssetCatalog {
  const bossDir = path.join(PUBLIC_ROOT, "typingmonster", "bosses", bossId);
  const standardRoot = path.join(bossDir, "standard");
  const customRoot = path.join(bossDir, "custom");

  const standard = toRelativePaths(walkPngFiles(standardRoot), standardRoot);
  const custom = toRelativePaths(walkPngFiles(customRoot), customRoot);
  const meta = readMetadata(bossDir);
  const byAnimation = groupByAnimation(standard, custom);

  const animations = Object.keys(byAnimation).sort();
  for (const a of meta.exportedStandard ?? []) {
    if (!animations.includes(a)) animations.push(a);
  }
  for (const a of meta.exportedCustom ?? []) {
    if (!animations.includes(a)) animations.push(a);
  }

  return {
    bossId,
    basePath: `/typingmonster/bosses/${bossId}`,
    frameSize: meta.frameSize,
    standard,
    custom,
    animations: [...new Set(animations)].sort(),
    byAnimation,
    exportedStandard: meta.exportedStandard,
    exportedCustom: meta.exportedCustom,
  };
}
