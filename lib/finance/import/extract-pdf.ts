"use client";

import {
  assessExtractionQuality,
  type ExtractionQuality,
} from "./extraction-quality";
import { ocrPdfPages, terminateOcrWorker } from "./ocr-pdf-pages";
import {
  extractPageTextFromItems,
  loadPdfDocument,
  type TextItem,
} from "./pdf-page-text";
import { countTxnIds, repairExtractedTxnIds } from "./parsers/txn-id-repair";

export type PdfExtractionMethod = "pdfjs" | "hybrid";

export interface PdfExtractProgress {
  phase: "pdfjs" | "ocr";
  page?: number;
  pageIndex?: number;
  pageTotal?: number;
  percent: number;
}

export interface PdfExtractResult {
  text: string;
  numPages: number;
  pageCharCounts: number[];
  pageTxnCounts: number[];
  txnIdCount: number;
  extractionMethod: PdfExtractionMethod;
  ocrPages: number[];
  quality: ExtractionQuality;
}

function mergePageTexts(pageTexts: string[]): string {
  return repairExtractedTxnIds(pageTexts.join("\n\n"));
}

/** Combine pdf.js + OCR so txn IDs from either source are kept (do not pick only one). */
function mergePageSources(pdfjsText: string, ocrText: string): string {
  const parts = [pdfjsText.trim(), ocrText.trim()].filter((p) => p.length > 0);
  return repairExtractedTxnIds(parts.join("\n\n"));
}

/**
 * Hybrid PDF extraction: pdf.js text layer first, Tesseract OCR on weak pages if quality fails.
 */
export async function extractPdfWithMeta(
  file: File,
  onProgress?: (p: PdfExtractProgress) => void,
  filename: string = file.name,
): Promise<PdfExtractResult> {
  const buffer = await file.arrayBuffer();
  const doc = await loadPdfDocument(buffer);

  const pageTexts: string[] = [];
  const pageCharCounts: number[] = [];
  const pageTxnCounts: number[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    onProgress?.({
      phase: "pdfjs",
      page: i,
      pageIndex: i - 1,
      pageTotal: doc.numPages,
      percent: (i / doc.numPages) * 0.45,
    });

    const content = await doc.getPage(i).then((p) => p.getTextContent());
    const { text, charCount, txnCount } = extractPageTextFromItems(
      content.items as TextItem[],
    );
    pageTexts.push(text);
    pageCharCounts.push(charCount);
    pageTxnCounts.push(txnCount);
  }

  let merged = mergePageTexts(pageTexts);
  let quality = assessExtractionQuality(merged, filename);
  let ocrPages: number[] = [];
  let extractionMethod: PdfExtractionMethod = "pdfjs";

  if (!quality.passes) {
    extractionMethod = "hybrid";

    const allPageNums = Array.from({ length: doc.numPages }, (_, i) => i + 1);
    const ocrResults = await ocrPdfPages(doc, allPageNums, (pageNum, idx, total) => {
      onProgress?.({
        phase: "ocr",
        page: pageNum,
        pageIndex: idx,
        pageTotal: total,
        percent: 0.45 + ((idx + 1) / total) * 0.5,
      });
    });

    ocrPages = [];
    for (let i = 0; i < doc.numPages; i++) {
      const pageNum = i + 1;
      const pdfjsText = pageTexts[i];
      const ocrText = ocrResults.get(pageNum) ?? "";
      const combined = mergePageSources(pdfjsText, ocrText);
      const combinedN = countTxnIds(combined);
      if (ocrText.trim()) ocrPages.push(pageNum);
      pageTexts[i] = combined;
      pageCharCounts[i] = combined.length;
      pageTxnCounts[i] = combinedN;
    }

    merged = mergePageTexts(pageTexts);
    quality = assessExtractionQuality(merged, filename);
  }

  await terminateOcrWorker();

  onProgress?.({ phase: "pdfjs", percent: 1 });

  return {
    text: merged,
    numPages: doc.numPages,
    pageCharCounts,
    pageTxnCounts,
    txnIdCount: quality.txnIdCount,
    extractionMethod,
    ocrPages,
    quality,
  };
}

export async function extractPdfText(file: File): Promise<string> {
  return (await extractPdfWithMeta(file)).text;
}
