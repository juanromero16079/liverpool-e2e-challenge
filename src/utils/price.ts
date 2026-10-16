export function parseMexicanPrice(raw: string): number {
  const cleaned = raw.replace(/\$/g, '').replace(/\s/g, '').replace(/,/g, '');
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) {
    throw new Error(`Unable to parse price from "${raw}"`);
  }
  return value;
}

export function pricesClose(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance;
}
