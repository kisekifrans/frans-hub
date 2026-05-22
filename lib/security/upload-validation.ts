import { FINANCE_PDF_MAX_BYTES } from "@/lib/finance/import/constants";

/** PDF files must begin with %PDF- (bytes 25 50 44 46 2D). */
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

export function pdfFileTooLargeMessage(): string {
  const mb = Math.round(FINANCE_PDF_MAX_BYTES / 1024 / 1024);
  return `File too large (max ${mb} MB).`;
}

export function validatePdfUpload(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are allowed.";
  }
  if (file.type && file.type !== "application/pdf") {
    return "Invalid file type. Upload a PDF.";
  }
  if (file.size <= 0) return "File is empty.";
  if (file.size > FINANCE_PDF_MAX_BYTES) {
    return pdfFileTooLargeMessage();
  }
  return null;
}

function hasPdfMagicSignature(head: Uint8Array): boolean {
  if (head.length < PDF_MAGIC.length) return false;
  for (let i = 0; i < PDF_MAGIC.length; i++) {
    if (head[i] !== PDF_MAGIC[i]) return false;
  }
  return true;
}

/** Sniff first bytes (browser File from input). Fails closed on read errors. */
export async function validatePdfMagic(file: File): Promise<string | null> {
  const basic = validatePdfUpload(file);
  if (basic) return basic;

  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, PDF_MAGIC.length).arrayBuffer());
  } catch {
    return "Could not read the file. Try again.";
  }

  if (!hasPdfMagicSignature(head)) {
    return "File does not look like a valid PDF.";
  }
  return null;
}

/** Safe message for import job rows and toasts (no stack traces). */
export function pdfImportUserErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.trim();
    if (/invalid pdf|password|corrupt|encrypted/i.test(msg)) {
      return "Could not read this PDF. It may be corrupted, password-protected, or not a valid statement.";
    }
    if (/storage|upload|bucket|413|too large/i.test(msg)) {
      return pdfFileTooLargeMessage();
    }
    if (msg.length > 0 && msg.length < 200 && !/^\s*at\s/m.test(msg)) {
      return msg;
    }
  }
  return "PDF import failed. Please try again with a different file.";
}
