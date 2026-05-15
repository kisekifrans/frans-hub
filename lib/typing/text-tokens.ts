export type TextToken =
  | { kind: "word"; start: number; content: string }
  | { kind: "space"; start: number }
  | { kind: "break"; start: number };

/** Split typing content into words, spaces, and line breaks (preserves indices). */
export function tokenizeTypingText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === "\n") {
      tokens.push({ kind: "break", start: i });
      i += 1;
    } else if (ch === " ") {
      tokens.push({ kind: "space", start: i });
      i += 1;
    } else {
      const start = i;
      while (i < text.length && text[i] !== " " && text[i] !== "\n") {
        i += 1;
      }
      tokens.push({ kind: "word", start, content: text.slice(start, i) });
    }
  }
  return tokens;
}

/** Index of the token that contains `cursor`, or -1. */
export function tokenIndexAtCursor(
  tokens: TextToken[],
  cursor: number,
): number {
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t]!;
    if (tok.kind === "break") {
      if (cursor === tok.start) return t;
      continue;
    }
    if (tok.kind === "space") {
      if (cursor === tok.start) return t;
      continue;
    }
    const end = tok.start + tok.content.length;
    if (cursor >= tok.start && cursor <= end) return t;
  }
  return -1;
}
