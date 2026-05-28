/** Quick-pick emojis for outreach message templates (Discord-safe). */
export const OUTREACH_TEMPLATE_EMOJIS = [
  "👋",
  "🙏",
  "✅",
  "❌",
  "⚠️",
  "📊",
  "📈",
  "📉",
  "⏱️",
  "💬",
  "📩",
  "🔔",
  "🎯",
  "💪",
  "✨",
  "🔍",
  "📝",
  "🙂",
  "😊",
  "👍",
] as const;

export function insertTextAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
): { value: string; cursor: number } {
  const next = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
  const cursor = selectionStart + insertion.length;
  return { value: next, cursor };
}
