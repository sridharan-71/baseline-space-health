import type { MetricId, MissionInput, Reading, SelfReport } from '../../domain/types';

/** Build a small mission: `pre` values for days -n…-1, then `flight` values keyed by day. */
export function mission(
  metricId: MetricId,
  pre: number[],
  flight: Record<number, number>,
  selfReports: SelfReport[] = [],
): MissionInput {
  const readings: Reading[] = [];
  pre.forEach((v, i) => readings.push({ metricId, missionDay: -pre.length + i, value: v, source: 'SIMULATED' }));
  for (const [d, v] of Object.entries(flight)) readings.push({ metricId, missionDay: Number(d), value: v, source: 'SIMULATED' });
  return {
    astronaut: { id: 'T', displayName: 'Test (SIMULATED)', isSimulated: true },
    readings,
    selfReports,
    currentDay: Math.max(...Object.keys(flight).map(Number), 1),
  };
}

/** n pre-flight values alternating mean ± delta → sample SD ≈ delta. */
export function alt(n: number, mean: number, delta: number): number[] {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? mean + delta : mean - delta));
}

export const BANNED = /diagnos|disease|infection|fever|prescri|medicat|dose|dosing|treatment|\bmg\b/i;
