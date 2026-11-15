import { validateReading } from '../domain/validation';
import type { MetricId, Reading } from '../domain/types';

// Index cache keyed on the readings array itself. It only speeds up lookups; results are identical.
const indexCache = new WeakMap<Reading[], Map<string, Reading>>();

const key = (metricId: MetricId, day: number) => `${metricId}|${day}`;

function buildIndex(readings: Reading[]): Map<string, Reading> {
  const idx = new Map<string, Reading>();
  for (const r of readings) {
    if (!validateReading(r).ok) continue;
    const k = key(r.metricId, r.missionDay);
    const prev = idx.get(k);
    // USER_ENTERED beats SIMULATED; among equals the LAST one in the array wins.
    if (!prev || !(prev.source === 'USER_ENTERED' && r.source === 'SIMULATED')) idx.set(k, r);
  }
  return idx;
}

function indexOf(readings: Reading[]): Map<string, Reading> {
  let idx = indexCache.get(readings);
  if (!idx) {
    idx = buildIndex(readings);
    indexCache.set(readings, idx);
  }
  return idx;
}

export function getReading(readings: Reading[], metricId: MetricId, day: number): Reading | null {
  return indexOf(readings).get(key(metricId, day)) ?? null;
}

export function availableDays(readings: Reading[], metricId: MetricId, fromDay: number, toDay: number): number[] {
  const idx = indexOf(readings);
  const out: number[] = [];
  for (let d = fromDay; d <= toDay; d++) if (idx.has(key(metricId, d))) out.push(d);
  return out;
}

/** Earliest day with any valid reading for this metric, or null. */
export function firstDay(readings: Reading[], metricId: MetricId): number | null {
  let min: number | null = null;
  for (const r of indexOf(readings).values()) {
    if (r.metricId === metricId && (min === null || r.missionDay < min)) min = r.missionDay;
  }
  return min;
}
