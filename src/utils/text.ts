export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function namesLikelyMatch(uiName: string, apiTitle: string): boolean {
  const a = normalizeText(uiName);
  const b = normalizeText(apiTitle);
  return a.includes(b) || b.includes(a) || a === b;
}
