import type {
  CanvasBackground,
  ExportFormat,
  ExportResult,
  SignatureStroke,
} from "./types";
import { getStrokeOutline, outlineToPath, renderStrokes } from "./render";

const EXPORT_SCALE = 3;

function createExportCanvas(
  logicalW: number,
  logicalH: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number } {
  const w = Math.round(logicalW * EXPORT_SCALE);
  const h = Math.round(logicalH * EXPORT_SCALE);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  return { canvas, ctx, w, h };
}

export async function exportSignature(
  strokes: SignatureStroke[],
  logicalW: number,
  logicalH: number,
  format: ExportFormat,
): Promise<ExportResult> {
  const background: CanvasBackground =
    format === "png-white" ? "paper" : "transparent";

  if (format === "svg") {
    return exportSvg(strokes, logicalW, logicalH, background);
  }

  const { canvas, ctx, w, h } = createExportCanvas(logicalW, logicalH);
  renderStrokes(ctx, strokes, logicalW, logicalH, background);

  const mime = "image/png";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      mime,
      1,
    );
  });

  return {
    format,
    blob,
    url: URL.createObjectURL(blob),
    width: w,
    height: h,
    label:
      format === "png-transparent"
        ? "PNG (transparent)"
        : "PNG (white background)",
  };
}

function exportSvg(
  strokes: SignatureStroke[],
  width: number,
  height: number,
  background: CanvasBackground,
): ExportResult {
  const paths = strokes
    .map((stroke) => {
      const outline = getStrokeOutline(
        stroke.points,
        stroke.brushStyle,
        stroke.size,
        width,
        height,
      );
      const d = outlineToPath(outline);
      if (!d) return "";
      return `<path d="${d}" fill="${stroke.color}"/>`;
    })
    .filter(Boolean)
    .join("\n");

  const bgRect =
    background === "paper"
      ? `<rect width="100%" height="100%" fill="#ffffff"/>`
      : "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${bgRect}
${paths}
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  return {
    format: "svg",
    blob,
    url: URL.createObjectURL(blob),
    width: Math.round(width * EXPORT_SCALE),
    height: Math.round(height * EXPORT_SCALE),
    label: "SVG vector",
  };
}

export function revokeExportUrl(url: string) {
  URL.revokeObjectURL(url);
}
