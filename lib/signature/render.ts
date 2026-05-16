import getStroke from "perfect-freehand";
import type { SignatureStroke, StrokePoint } from "./types";
import { getFreehandOptions } from "./brush";

export function outlineToPath(outline: number[][]): string {
  if (outline.length < 2) return "";

  const max = outline.length - 1;
  return outline.reduce(
    (acc, [x, y], i) => {
      if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
      const [nx, ny] = outline[(i + 1) % outline.length]!;
      const midX = (x + nx) / 2;
      const midY = (y + ny) / 2;
      return `${acc} Q ${x.toFixed(2)} ${y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
    },
    "",
  ) + " Z";
}

export function getStrokeOutline(
  points: StrokePoint[],
  brushStyle: SignatureStroke["brushStyle"],
  size: number,
  width: number,
  height: number,
): number[][] {
  if (points.length < 1) return [];

  const pixelPoints = points.map((p) => ({
    x: p.x * width,
    y: p.y * height,
    pressure: p.pressure,
  }));

  return getStroke(
    pixelPoints,
    getFreehandOptions(brushStyle, size),
  ) as number[][];
}

export function drawStrokeOnContext(
  ctx: CanvasRenderingContext2D,
  stroke: SignatureStroke,
  width: number,
  height: number,
) {
  const outline = getStrokeOutline(
    stroke.points,
    stroke.brushStyle,
    stroke.size,
    width,
    height,
  );
  if (outline.length < 2) return;

  const path = new Path2D(outlineToPath(outline));
  ctx.fillStyle = stroke.color;
  ctx.fill(path);
}

export function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: SignatureStroke[],
  width: number,
  height: number,
  background: "transparent" | "paper",
) {
  ctx.clearRect(0, 0, width, height);

  if (background === "paper") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  for (const stroke of strokes) {
    drawStrokeOnContext(ctx, stroke, width, height);
  }
}

export function pressureFromPointer(
  pointerPressure: number | undefined,
  points: StrokePoint[],
): number {
  if (pointerPressure != null && pointerPressure > 0) {
    return Math.min(1, Math.max(0.15, pointerPressure));
  }
  if (points.length < 2) return 0.5;
  const a = points[points.length - 1]!;
  const b = points[points.length - 2]!;
  const dx = (a.x - b.x) * 1000;
  const dy = (a.y - b.y) * 1000;
  const v = Math.hypot(dx, dy);
  return Math.max(0.25, Math.min(1, 1 - v / 28));
}
