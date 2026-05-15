/** Fisher–Yates shuffle (mutates copy). */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

const MAX_RECENT = 72;

let recentWords: string[] = [];
let lastQuote = "";
let lastCodeSnippet = "";

export function clearWordPickerHistory() {
  recentWords = [];
  lastQuote = "";
  lastCodeSnippet = "";
}

/**
 * Pick `count` words with minimal repetition within the test and across recent restarts.
 */
export function pickWords(pool: readonly string[], count: number): string[] {
  if (count <= 0) return [];
  if (pool.length === 0) return [];

  const recentSet = new Set(recentWords.slice(-MAX_RECENT));
  let bag = shuffle(
    pool.length >= count * 2
      ? [...pool].filter((w) => !recentSet.has(w))
      : [...pool],
  );
  if (bag.length === 0) bag = shuffle([...pool]);

  const result: string[] = [];
  let guard = 0;
  const maxGuard = count * 40;

  while (result.length < count && guard < maxGuard) {
    guard += 1;
    if (bag.length === 0) {
      bag = shuffle([...pool]);
    }
    const word = bag.pop()!;
    if (result.length > 0 && result[result.length - 1] === word) {
      bag.unshift(word);
      continue;
    }
    if (recentSet.has(word) && pool.length > count + MAX_RECENT / 2) {
      continue;
    }
    result.push(word);
    recentWords.push(word);
  }

  while (result.length < count) {
    const fallback = pool[result.length % pool.length]!;
    if (result[result.length - 1] !== fallback) result.push(fallback);
    else result.push(pool[(result.length + 3) % pool.length]!);
  }

  if (recentWords.length > MAX_RECENT * 2) {
    recentWords = recentWords.slice(-MAX_RECENT);
  }

  return result;
}

export function pickQuote(quotes: readonly string[]): string {
  const choices =
    quotes.length > 1
      ? quotes.filter((q) => q !== lastQuote)
      : [...quotes];
  const pick = shuffle(choices)[0] ?? quotes[0]!;
  lastQuote = pick;
  return pick;
}

export function pickCodeSnippet(snippets: readonly string[]): string {
  const choices =
    snippets.length > 1
      ? snippets.filter((s) => s !== lastCodeSnippet)
      : [...snippets];
  const pick = shuffle(choices)[0] ?? snippets[0]!;
  lastCodeSnippet = pick;
  return pick;
}

export function pickNumbers(count: number): string {
  const nums: string[] = [];
  let prev = -1;
  for (let i = 0; i < count; i++) {
    let n = Math.floor(Math.random() * 10000);
    let tries = 0;
    while (n === prev && tries < 12) {
      n = Math.floor(Math.random() * 10000);
      tries += 1;
    }
    prev = n;
    nums.push(String(n));
  }
  return nums.join(" ");
}
