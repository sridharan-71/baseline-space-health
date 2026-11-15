import { phaseOf } from '../domain/phase';
import type { Direction } from '../domain/types';
import { MAX_LOOKBACK_DAYS, PERSIST_WINDOW, WATCH_Z } from './config';

/** Positive = deviation in the unhealthy direction. */
export function unhealthyZ(z: number, direction: Direction): number {
  if (direction === 'up') return z;
  if (direction === 'down') return -z;
  return Math.abs(z);
}

/**
 * The last PERSIST_WINDOW available days ≤ day, within [day − MAX_LOOKBACK_DAYS + 1, day]
 * and in the same phase as `day`. `missing` = calendar days from the first window day to `day` with no reading.
 */
export function windowDays(available: number[], day: number): { days: number[]; missing: number } {
  const phase = phaseOf(day);
  const start = day - MAX_LOOKBACK_DAYS + 1;
  const candidates = available
    .filter((d) => d <= day && d >= start && phaseOf(d) === phase)
    .sort((a, b) => a - b);
  const days = candidates.slice(-PERSIST_WINDOW);
  if (days.length === 0) return { days, missing: 0 };
  const first = days[0]!;
  const availSet = new Set(available);
  let missing = 0;
  for (let d = first; d <= day; d++) {
    if (d === 0) continue;
    if (!availSet.has(d)) missing++;
  }
  return { days, missing };
}

export function persistenceCount(zByDay: Map<number, number>, days: number[], direction: Direction): number {
  let count = 0;
  for (const d of days) {
    const z = zByDay.get(d);
    if (z === undefined || Number.isNaN(z)) continue;
    if (unhealthyZ(z, direction) >= WATCH_Z) count++;
  }
  return count;
}
