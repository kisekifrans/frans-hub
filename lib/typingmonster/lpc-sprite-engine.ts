import {
  BOSS_ANIM_CANDIDATES,
  BOSS_ID,
  LPC_DIRECTION_ROW,
  LPC_FRAME_COUNTS,
  LPC_FRAME_SIZE,
} from "./boss-config";
import {
  resolveAnimationFromCatalog,
} from "./animation-names";
import type { AssetCatalog } from "./asset-types";
import {
  catalogHasAnimation,
  findCompositeSheet,
  findLayerInCatalog,
  type CharacterData,
  type CharacterLayer,
} from "./lpc-paths";
import type { BossAnimState } from "./types";

export interface SpriteFrameRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface LoadedLayerSheet {
  image: HTMLImageElement;
  url: string;
}

export interface ComposedAnimation {
  name: string;
  layers: LoadedLayerSheet[];
  frameCount: number;
  fps: number;
  loop: boolean;
  frameSize: number;
}

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
let catalogCache: Promise<AssetCatalog> | null = null;

export function loadImage(url: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(url);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
  imageCache.set(url, promise);
  return promise;
}

/** Fetch scanned asset catalog (standard/ + custom/ trees). */
export async function fetchAssetCatalog(
  bossId = BOSS_ID,
): Promise<AssetCatalog> {
  if (!catalogCache) {
    catalogCache = fetch(`/api/typingmonster/assets/${bossId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Asset catalog unavailable");
        return r.json() as Promise<AssetCatalog>;
      })
      .catch((err) => {
        catalogCache = null;
        throw err;
      });
  }
  return catalogCache;
}

export function clearAssetCatalogCache() {
  catalogCache = null;
  imageCache.clear();
}

function detectFrameCount(
  sheet: HTMLImageElement,
  animation: string,
  frameSize: number,
): number {
  const cols = Math.max(1, Math.floor(sheet.width / frameSize));
  const rows = Math.max(1, Math.floor(sheet.height / frameSize));
  const fallback = LPC_FRAME_COUNTS[animation] ?? 4;
  if (rows === 1) return Math.min(cols, fallback);
  return Math.min(cols, fallback);
}

async function loadCompositeAnimation(
  catalog: AssetCatalog,
  animation: string,
  state: BossAnimState,
): Promise<ComposedAnimation | null> {
  const sheet = findCompositeSheet(catalog, animation);
  if (!sheet) return null;
  const image = await loadImage(sheet.url);
  if (!image) return null;
  const frameSize = catalog.frameSize || LPC_FRAME_SIZE;
  return {
    name: animation,
    layers: [{ image, url: sheet.url }],
    frameCount: detectFrameCount(image, animation, frameSize),
    fps: state === "idle" ? 6 : state === "attack" ? 14 : 12,
    loop: state === "idle",
    frameSize,
  };
}

async function loadLayerForAnim(
  catalog: AssetCatalog,
  layer: CharacterLayer,
  animation: string,
): Promise<LoadedLayerSheet | null> {
  const hit = findLayerInCatalog(catalog, layer.fileName, animation);
  if (!hit) return null;
  const image = await loadImage(hit.url);
  if (!image) return null;
  return { image, url: hit.url };
}

function pickAnimationForState(
  catalog: AssetCatalog,
  state: BossAnimState,
): string | null {
  const available = new Set(catalog.animations);
  return resolveAnimationFromCatalog(
    BOSS_ANIM_CANDIDATES[state],
    available,
  );
}

async function loadLayeredAnimation(
  catalog: AssetCatalog,
  character: CharacterData,
  animation: string,
  state: BossAnimState,
): Promise<ComposedAnimation | null> {
  const sorted = [...character.layers].sort(
    (a, b) => a.zPos - b.zPos || (a.layerNum ?? 0) - (b.layerNum ?? 0),
  );

  const layers: LoadedLayerSheet[] = [];
  const frameSize = catalog.frameSize || LPC_FRAME_SIZE;

  for (const layer of sorted) {
    let animToLoad = animation;
    if (
      layer.supportedAnimations &&
      !layer.supportedAnimations.includes(animation)
    ) {
      const fallback = layer.supportedAnimations.find((a) =>
        catalogHasAnimation(catalog, a),
      );
      if (!fallback) continue;
      animToLoad = fallback;
    }

    const loaded = await loadLayerForAnim(catalog, layer, animToLoad);
    if (loaded) layers.push(loaded);
  }

  if (layers.length === 0) return null;

  const body =
    layers.find((l) => l.url.includes("/bodies/"))?.image ?? layers[0]!.image;
  return {
    name: animation,
    layers,
    frameCount: detectFrameCount(body, animation, frameSize),
    fps: state === "idle" ? 6 : state === "attack" ? 14 : 12,
    loop: state === "idle",
    frameSize,
  };
}

export async function loadComposedAnimation(
  character: CharacterData,
  catalog: AssetCatalog,
  state: BossAnimState,
): Promise<ComposedAnimation | null> {
  const animName = pickAnimationForState(catalog, state);
  if (!animName) return null;

  const composite = await loadCompositeAnimation(catalog, animName, state);
  if (composite) return composite;

  return loadLayeredAnimation(catalog, character, animName, state);
}

export async function preloadBossAnimations(
  character: CharacterData,
): Promise<Partial<Record<BossAnimState, ComposedAnimation>>> {
  const catalog = await fetchAssetCatalog();
  const states: BossAnimState[] = ["idle", "attack", "hurt", "death"];
  const result: Partial<Record<BossAnimState, ComposedAnimation>> = {};

  for (const state of states) {
    const anim = await loadComposedAnimation(character, catalog, state);
    if (anim) result[state] = anim;
  }

  return result;
}

export function getFrameRect(
  frameIndex: number,
  sheet: HTMLImageElement,
  frameSize: number,
): SpriteFrameRect {
  const cols = Math.max(1, Math.floor(sheet.width / frameSize));
  const rows = Math.max(1, Math.floor(sheet.height / frameSize));
  const col = frameIndex % cols;
  const row =
    rows >= 4 ? LPC_DIRECTION_ROW : Math.min(LPC_DIRECTION_ROW, rows - 1);
  return {
    sx: col * frameSize,
    sy: row * frameSize,
    sw: frameSize,
    sh: frameSize,
  };
}

export function drawComposedFrame(
  ctx: CanvasRenderingContext2D,
  anim: ComposedAnimation,
  frameIndex: number,
  dx: number,
  dy: number,
  scale: number,
) {
  const idx = anim.loop
    ? frameIndex % anim.frameCount
    : Math.min(frameIndex, anim.frameCount - 1);

  const fs = anim.frameSize || LPC_FRAME_SIZE;

  for (const layer of anim.layers) {
    const rect = getFrameRect(idx, layer.image, fs);
    const w = rect.sw * scale;
    const h = rect.sh * scale;
    ctx.drawImage(
      layer.image,
      rect.sx,
      rect.sy,
      rect.sw,
      rect.sh,
      dx - w / 2,
      dy - h,
      w,
      h,
    );
  }
}

export async function loadCharacterData(): Promise<CharacterData> {
  const res = await fetch(`/typingmonster/bosses/${BOSS_ID}/character.json`);
  if (!res.ok) throw new Error("Missing character.json");
  return res.json() as Promise<CharacterData>;
}
