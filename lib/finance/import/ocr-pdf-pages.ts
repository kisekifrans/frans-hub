"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Worker } from "tesseract.js";

const OCR_SCALE = 3;

let sharedWorker: Worker | null = null;

async function getOcrWorker(): Promise<Worker> {
  if (sharedWorker) return sharedWorker;
  const { createWorker, PSM } = await import("tesseract.js");
  try {
    sharedWorker = await createWorker("eng+ind", 1, { logger: () => {} });
  } catch {
    sharedWorker = await createWorker("eng", 1, { logger: () => {} });
  }
  await sharedWorker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  });
  return sharedWorker;
}

export async function terminateOcrWorker(): Promise<void> {
  if (sharedWorker) {
    await sharedWorker.terminate();
    sharedWorker = null;
  }
}

async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNum: number,
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: OCR_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function ocrPdfPage(
  doc: PDFDocumentProxy,
  pageNum: number,
): Promise<string> {
  const canvas = await renderPageToCanvas(doc, pageNum);
  const worker = await getOcrWorker();
  const { data } = await worker.recognize(canvas);
  return data.text ?? "";
}

export async function ocrPdfPages(
  doc: PDFDocumentProxy,
  pageNumbers: number[],
  onPage?: (pageNum: number, index: number, total: number) => void,
): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  const total = pageNumbers.length;

  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNum = pageNumbers[i];
    onPage?.(pageNum, i, total);
    const text = await ocrPdfPage(doc, pageNum);
    out.set(pageNum, text);
    console.log(
      "[pdf-ocr] page",
      pageNum,
      "chars",
      text.length,
      "txnIds",
      (text.match(/RB-\d+-\d+|F-\d{6,}/gi) || []).length,
    );
  }

  return out;
}
