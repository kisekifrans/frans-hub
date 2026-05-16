export type BrushStyle = "pen" | "marker" | "fountain" | "sharp";

export type CanvasBackground = "transparent" | "paper";

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

/** Normalized 0–1 coordinates so strokes survive canvas resize. */
export interface SignatureStroke {
  id: string;
  points: StrokePoint[];
  color: string;
  size: number;
  brushStyle: BrushStyle;
}

export interface SignatureDraft {
  version: 1;
  strokes: SignatureStroke[];
  brushSize: number;
  brushStyle: BrushStyle;
  color: string;
  background: CanvasBackground;
  savedAt: number;
}

export type ExportFormat = "png-transparent" | "png-white" | "svg";

export interface ExportResult {
  format: ExportFormat;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  label: string;
}
