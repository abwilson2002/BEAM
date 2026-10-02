/** Splits "a, b,, c" into ["a", "b", "c"]. */
export function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
