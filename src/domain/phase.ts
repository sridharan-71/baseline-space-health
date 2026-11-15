import type { Phase } from './types';

export function phaseOf(day: number): Phase {
  if (day < 0) return 'PREFLIGHT';
  if (day === 0) return 'LAUNCH';
  return 'INFLIGHT';
}

/** "L-30" for -30, "Launch" for 0, "FD97" for 97. */
export function formatDay(day: number): string {
  if (day < 0) return `L${day}`;
  if (day === 0) return 'Launch';
  return `FD${day}`;
}
