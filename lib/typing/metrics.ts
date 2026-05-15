export function calcWpm(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const minutes = durationMs / 60000;
  return Math.round(correctChars / 5 / minutes);
}

export function calcAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}
