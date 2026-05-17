/** Textarea caret helpers for snippet composer. */

export function insertAtCaret(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
): { next: string; caret: number } {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(0, Math.min(selectionEnd, value.length));
  const next = value.slice(0, start) + insertion + value.slice(end);
  return { next, caret: start + insertion.length };
}

export function focusCaret(textarea: HTMLTextAreaElement, position: number) {
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(position, position);
  });
}

export function resizeTextarea(
  el: HTMLTextAreaElement,
  min = 120,
  max = 360,
) {
  el.style.height = "auto";
  el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
}

export function countCharacters(text: string): number {
  return [...text].length;
}
