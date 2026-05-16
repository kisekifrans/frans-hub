"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateId } from "@/lib/utils";
import { saveDraft, loadDraft } from "@/lib/signature/storage";
import type {
  BrushStyle,
  CanvasBackground,
  SignatureStroke,
  StrokePoint,
} from "@/lib/signature/types";
import { pressureFromPointer } from "@/lib/signature/render";

const MAX_HISTORY = 80;

export function useSignaturePad() {
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [redoStack, setRedoStack] = useState<SignatureStroke[]>([]);
  const [brushSize, setBrushSize] = useState(4);
  const [brushStyle, setBrushStyle] = useState<BrushStyle>("pen");
  const [color, setColor] = useState("#0f0f12");
  const [background, setBackground] = useState<CanvasBackground>("paper");
  const [draftSaved, setDraftSaved] = useState(false);
  const [restored, setRestored] = useState(false);

  const activeStrokeRef = useRef<SignatureStroke | null>(null);
  const drawingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft?.strokes.length) {
      setStrokes(draft.strokes);
      setBrushSize(draft.brushSize);
      setBrushStyle(draft.brushStyle);
      setColor(draft.color);
      setBackground(draft.background);
      setRestored(true);
    }
  }, []);

  const persistDraft = useCallback(
    (nextStrokes: SignatureStroke[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveDraft({
          strokes: nextStrokes,
          brushSize,
          brushStyle,
          color,
          background,
        });
        setDraftSaved(true);
        window.setTimeout(() => setDraftSaved(false), 2200);
      }, 400);
    },
    [brushSize, brushStyle, color, background],
  );

  useEffect(() => {
    if (strokes.length === 0 && !restored) return;
    persistDraft(strokes);
  }, [strokes, brushSize, brushStyle, color, background, persistDraft, restored]);

  const commitStroke = useCallback(
    (stroke: SignatureStroke) => {
      setStrokes((prev) => {
        const next = [...prev, stroke].slice(-MAX_HISTORY);
        return next;
      });
      setRedoStack([]);
    },
    [],
  );

  const startStroke = useCallback(
    (x: number, y: number, pressure?: number) => {
      const point: StrokePoint = {
        x,
        y,
        pressure: pressure ?? 0.5,
      };
      activeStrokeRef.current = {
        id: generateId("stroke"),
        points: [point],
        color,
        size: brushSize,
        brushStyle,
      };
      drawingRef.current = true;
    },
    [brushSize, brushStyle, color],
  );

  const extendStroke = useCallback(
    (x: number, y: number, pressure?: number) => {
      const stroke = activeStrokeRef.current;
      if (!stroke || !drawingRef.current) return;

      const last = stroke.points[stroke.points.length - 1];
      if (last) {
        const dx = (x - last.x) * 1000;
        const dy = (y - last.y) * 1000;
        if (Math.hypot(dx, dy) < 1.2) return;
      }

      const pressureVal = pressureFromPointer(pressure, stroke.points);
      stroke.points.push({ x, y, pressure: pressureVal });
    },
    [],
  );

  const endStroke = useCallback(() => {
    const stroke = activeStrokeRef.current;
    drawingRef.current = false;
    activeStrokeRef.current = null;
    if (stroke && stroke.points.length > 0) {
      commitStroke(stroke);
    }
  }, [commitStroke]);

  const undo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const removed = prev[prev.length - 1]!;
      setRedoStack((r) => [...r, removed]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const stroke = prev[prev.length - 1]!;
      setStrokes((s) => [...s, stroke]);
      return prev.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => {
    setStrokes([]);
    setRedoStack([]);
    activeStrokeRef.current = null;
    drawingRef.current = false;
  }, []);

  const getActiveStroke = useCallback(() => activeStrokeRef.current, []);

  const isDrawing = useCallback(() => drawingRef.current, []);

  return {
    strokes,
    redoStack,
    brushSize,
    setBrushSize,
    brushStyle,
    setBrushStyle,
    color,
    setColor,
    background,
    setBackground,
    draftSaved,
    restored,
    startStroke,
    extendStroke,
    endStroke,
    getActiveStroke,
    isDrawing,
    undo,
    redo,
    clear,
    canUndo: strokes.length > 0,
    canRedo: redoStack.length > 0,
  };
}
