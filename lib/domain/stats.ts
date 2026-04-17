export function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function rollingMean(values: readonly number[], window: number): Array<number | null> {
  if (window <= 0) return values.map(() => null);
  const out: Array<number | null> = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    out.push(mean(slice));
  }
  return out;
}

export function min(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let m = values[0] as number;
  for (const v of values) if (v < m) m = v;
  return m;
}

export function max(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let m = values[0] as number;
  for (const v of values) if (v > m) m = v;
  return m;
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const a = sorted[mid - 1];
    const b = sorted[mid];
    if (typeof a === "number" && typeof b === "number") return (a + b) / 2;
    return null;
  }
  const v = sorted[mid];
  return typeof v === "number" ? v : null;
}
