/** Normalize and repair CSV text / cell values for production UTF-8. */

const MOJIBAKE_RE = /(?:Ã[\u0080-\u00BF]|â€[\u0090-\u009F]|ï¿½|\uFFFD)/;

function scoreMojibake(text: string): number {
  const hits = text.match(/(?:Ã.|â€.|ï¿½|\uFFFD)/g);
  return hits?.length ?? 0;
}

/** Classic fix: UTF-8 bytes misread as Latin-1 / Windows-1252. */
export function fixUtf8Mojibake(text: string): string {
  if (!MOJIBAKE_RE.test(text)) return text;
  try {
    const bytes = Uint8Array.from(text, (c) => c.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (decoded && scoreMojibake(decoded) < scoreMojibake(text)) {
      return decoded;
    }
  } catch {
    /* keep original */
  }
  return text;
}

export function sanitizeCellValue(value: string): string {
  if (!value) return "";
  let s = value.replace(/\uFEFF/g, "").replace(/\0/g, "");
  s = fixUtf8Mojibake(s);
  try {
    s = s.normalize("NFC");
  } catch {
    /* ignore */
  }
  s = s.replace(/\uFFFD/g, "");
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return s.trim();
}

export function decodeCsvBytes(bytes: Uint8Array): string {
  let offset = 0;
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    offset = 3;
  }

  const slice = bytes.subarray(offset);
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(slice);
  let best = fixUtf8Mojibake(utf8);
  let bestScore = scoreMojibake(best);

  if (bestScore > 1) {
    try {
      const win = new TextDecoder("windows-1252").decode(slice);
      const winScore = scoreMojibake(win);
      if (winScore < bestScore) {
        best = win;
        bestScore = winScore;
      }
    } catch {
      /* windows-1252 unsupported */
    }

    try {
      const latin = new TextDecoder("iso-8859-1").decode(slice);
      const latinScore = scoreMojibake(latin);
      if (latinScore < bestScore) {
        best = latin;
      }
    } catch {
      /* ignore */
    }
  }

  return best;
}

export async function readCsvText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return decodeCsvBytes(new Uint8Array(buffer));
}
