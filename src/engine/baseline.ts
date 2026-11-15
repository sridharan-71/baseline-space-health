import { METRICS } from '../domain/metrics';
import type { MetricId, PreflightBaseline, Reading } from '../domain/types';
import { getReading } from './readings';

const PREFLIGHT_LOOKBACK = 60; // validation allows days down to -60

/**
 * Pre-flight mean and sample SD (n − 1), floored at the metric's sdFloor.
 * One reading per pre-flight day (via getReading).
 * n = 0 → { mean: NaN, sd: sdFloor, n: 0 }. Callers MUST check n before using mean.
 */
export function computePreflightBaseline(readings: Reading[], metricId: MetricId): PreflightBaseline {
  const floor = METRICS[metricId].sdFloor;
  const values: number[] = [];
  for (let d = -PREFLIGHT_LOOKBACK; d < 0; d++) {
    const r = getReading(readings, metricId, d);
    if (r) values.push(r.value);
  }
  const n = values.length;
  if (n === 0) return { mean: NaN, sd: floor, n: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  if (n < 2) return { mean, sd: floor, n };
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1);
  return { mean, sd: Math.max(Math.sqrt(variance), floor), n };
}
