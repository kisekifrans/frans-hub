export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
