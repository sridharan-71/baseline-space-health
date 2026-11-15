// HYPOTHETICAL adversarial simulations for auditing the temperature engine.
// Nothing here is real astronaut data, and no parameter here is a research finding:
// adaptation sizes/timings, drift sizes, noise, outliers and sensor faults are all
// "what if" choices made to try to BREAK the algorithm. See research/10_ADVERSARIAL_STRESS_TEST_RESULTS.md.
import type { MissionInput, Reading } from '../../domain/types';
import { gaussian, mulberry32 } from './rng';

export const ADV_PRE_MEAN = 36.75;
export const ADV_FIRST_DAY = -30;
export const ADV_LAST_DAY = 120;

export interface AdaptationPattern {
  /** Size relative to the research group mean (+1.0 °C). */
  scale: number;
  /** Day the rise levels off (linear ramp). */
  plateauDay: number;
  /** Days before the rise starts (0 = starts at launch). */
  delayDays?: number;
}

/** An abnormal (non-adaptation) physiological change. */
export interface AbnormalPattern {
  start: number;
  /** Days to ramp linearly from 0 to `size` (1 = sudden). */
  rampDays: number;
  size: number;
  /** Last abnormal day (inclusive). Omit = persists to the end of the mission. */
  end?: number;
}

export interface DataPattern {
  /** Fraction of in-flight days randomly missing. */
  randomMissing?: number;
  /** Inclusive in-flight blocks with no readings. */
  missingBlocks?: [number, number][];
  /** From this day on, readings only every other day. */
  everyOtherDayFrom?: number;
  /** Fraction of days with a one-day sensor spike of `outlierSize` °C (not physiological). */
  outlierFraction?: number;
  outlierSize?: number;
  /** Sensor artefact: constant step of `stepSize` from `stepAt` (not physiological). */
  sensorStepAt?: number;
  sensorStepSize?: number;
  /** Sensor artefact: slow drift of `driftPerDay` °C/day from `driftFrom` (not physiological). */
  sensorDriftFrom?: number;
  sensorDriftPerDay?: number;
}

export interface AdversarialScenario {
  id: string;
  group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'N';
  label: string;
  adapt: AdaptationPattern;
  abnormal: AbnormalPattern[];
  data?: DataPattern;
  noiseSd?: number;
}

export function adaptationOffset(a: AdaptationPattern, day: number): number {
  const delay = a.delayDays ?? 0;
  if (day <= delay) return 0;
  return a.scale * Math.min((day - delay) / (a.plateauDay - delay), 1);
}

export function abnormalOffset(list: AbnormalPattern[], day: number): number {
  let total = 0;
  for (const p of list) {
    if (day < p.start) continue;
    if (p.end !== undefined && day > p.end) continue;
    total += p.size * Math.min((day - p.start + 1) / Math.max(p.rampDays, 1), 1);
  }
  return total;
}

export function sensorOffset(d: DataPattern | undefined, day: number): number {
  if (!d) return 0;
  let s = 0;
  if (d.sensorStepAt !== undefined && day >= d.sensorStepAt) s += d.sensorStepSize ?? 0;
  if (d.sensorDriftFrom !== undefined && day >= d.sensorDriftFrom) s += (day - d.sensorDriftFrom + 1) * (d.sensorDriftPerDay ?? 0);
  return s;
}

export interface AdversarialMission {
  input: MissionInput;
  outlierDays: Set<number>;
}

export function adversarialMission(sc: AdversarialScenario, seed: number): AdversarialMission {
  const rng = mulberry32(seed * 7919 + 17);
  const noiseSd = sc.noiseSd ?? 0.1;
  const readings: Reading[] = [];
  const outlierDays = new Set<number>();
  const d = sc.data;
  for (let day = ADV_FIRST_DAY; day <= ADV_LAST_DAY; day++) {
    if (day === 0) continue;
    // Draw every random number every day so scenarios stay comparable seed-by-seed.
    const noise = gaussian(rng) * noiseSd;
    const missDraw = rng();
    const outDraw = rng();
    if (day > 0) {
      if (d?.randomMissing && missDraw < d.randomMissing) continue;
      if (d?.missingBlocks?.some(([a, b]) => day >= a && day <= b)) continue;
      if (d?.everyOtherDayFrom !== undefined && day >= d.everyOtherDayFrom && (day - d.everyOtherDayFrom) % 2 === 1) continue;
    }
    let v = ADV_PRE_MEAN + noise;
    if (day > 0) v += adaptationOffset(sc.adapt, day) + abnormalOffset(sc.abnormal, day) + sensorOffset(d, day);
    if (day > 0 && d?.outlierFraction && outDraw < d.outlierFraction) {
      v += d.outlierSize ?? 1.0;
      outlierDays.add(day);
    }
    readings.push({ metricId: 'coreTemp', missionDay: day, value: Math.round(v * 100) / 100, source: 'SIMULATED' });
  }
  return {
    input: {
      astronaut: { id: 'SIM-ADV', displayName: 'Hypothetical astronaut (SIMULATED)', isSimulated: true },
      readings,
      selfReports: [],
      currentDay: ADV_LAST_DAY,
    },
    outlierDays,
  };
}

const research: AdaptationPattern = { scale: 1.0, plateauDay: 75 };

/** The audit's scenario set (Parts 2 and 5 of the audit brief). All HYPOTHETICAL. */
export const ADVERSARIAL_SCENARIOS: AdversarialScenario[] = [
  // N — controls
  { id: 'N1', group: 'N', label: 'Research-average adapter, nothing abnormal', adapt: research, abnormal: [] },
  { id: 'N2', group: 'N', label: 'Non-adapter, nothing abnormal', adapt: { scale: 0, plateauDay: 75 }, abnormal: [] },
  // A — gradual unexplained drift, several starts and sizes
  ...[30, 50, 70].flatMap((start) =>
    [0.3, 0.6].map((size) => ({
      id: `A-${start}-${size}`,
      group: 'A' as const,
      label: `Gradual drift +${size} °C over 30 days from FD${start}, then persists`,
      adapt: research,
      abnormal: [{ start, rampDays: 30, size }],
    })),
  ),
  // B — persistent drift during the adaptation ramp (worst case for calibration)
  { id: 'B-30-0.5', group: 'B', label: 'Drift +0.5 °C from FD30 over 30 days, persists to FD120', adapt: research, abnormal: [{ start: 30, rampDays: 30, size: 0.5 }] },
  { id: 'B-20-0.8-slow', group: 'B', label: 'Slow drift +0.8 °C from FD20 over 60 days, persists', adapt: research, abnormal: [{ start: 20, rampDays: 60, size: 0.8 }] },
  // B (critical) — drift where the Earth line cannot help (stays below 38 °C)
  { id: 'B-small-drift', group: 'B', label: 'Small adapter (+0.5 °C) + drift +0.5 °C from FD30 over 30 days, persists (ends below 38 °C)', adapt: { scale: 0.5, plateauDay: 75 }, abnormal: [{ start: 30, rampDays: 30, size: 0.5 }] },
  { id: 'B-none-drift', group: 'B', label: 'Non-adapter + drift +0.6 °C from FD40 over 30 days, persists (ends below 38 °C)', adapt: { scale: 0, plateauDay: 75 }, abnormal: [{ start: 40, rampDays: 30, size: 0.6 }] },
  { id: 'B-small-latedrift', group: 'B', label: 'Small adapter (+0.5 °C) + drift +0.5 °C from FD80 over 20 days, persists', adapt: { scale: 0.5, plateauDay: 75 }, abnormal: [{ start: 80, rampDays: 20, size: 0.5 }] },
  // C — sudden episode
  { id: 'C-60-0.6x5', group: 'C', label: 'Sudden +0.6 °C for 5 days at FD60', adapt: research, abnormal: [{ start: 60, rampDays: 1, size: 0.6, end: 64 }] },
  { id: 'C-60-0.6x20', group: 'C', label: 'Sudden +0.6 °C for 20 days at FD60', adapt: research, abnormal: [{ start: 60, rampDays: 1, size: 0.6, end: 79 }] },
  { id: 'C-60-0.6-persist', group: 'C', label: 'Sudden +0.6 °C at FD60 that never resolves', adapt: research, abnormal: [{ start: 60, rampDays: 1, size: 0.6 }] },
  // D — repeated episodes
  {
    id: 'D-repeat', group: 'D', label: 'Three 7-day +0.6 °C episodes at FD40, FD65, FD90', adapt: research,
    abnormal: [{ start: 40, rampDays: 1, size: 0.6, end: 46 }, { start: 65, rampDays: 1, size: 0.6, end: 71 }, { start: 90, rampDays: 1, size: 0.6, end: 96 }],
  },
  // E — early abnormality
  ...[3, 10, 17].map((start) => ({
    id: `E-${start}`, group: 'E' as const, label: `Sudden +0.6 °C for 7 days starting FD${start}`, adapt: research,
    abnormal: [{ start, rampDays: 1, size: 0.6, end: start + 6 }],
  })),
  { id: 'E-drift-5', group: 'E', label: 'Drift +0.5 °C over 20 days from FD5, persists', adapt: research, abnormal: [{ start: 5, rampDays: 20, size: 0.5 }] },
  // F — different adaptation patterns, each with a FD90 5-day +0.6 °C episode to detect
  ...([
    ['F-fast', 'Fast adapter (plateau FD30)', { scale: 1.0, plateauDay: 30 }],
    ['F-slow', 'Slow adapter (plateau FD150)', { scale: 1.0, plateauDay: 150 }],
    ['F-none', 'Non-adapter', { scale: 0, plateauDay: 75 }],
    ['F-delayed', 'Delayed adapter (starts FD30, plateau FD105)', { scale: 1.0, plateauDay: 105, delayDays: 30 }],
    ['F-large', 'Large adapter (+1.5 °C)', { scale: 1.5, plateauDay: 75 }],
    ['F-small', 'Small adapter (+0.5 °C)', { scale: 0.5, plateauDay: 75 }],
  ] as const).map(([id, label, adapt]) => ({
    id, group: 'F' as const, label: `${label} + 5-day +0.6 °C episode at FD90`, adapt: { ...adapt },
    abnormal: [{ start: 90, rampDays: 1, size: 0.6, end: 94 }],
  })),
  // G — noisy / incomplete data, each with the FD90 episode
  { id: 'G-missing30', group: 'G', label: '30% of days randomly missing + FD90 episode', adapt: research, abnormal: [{ start: 90, rampDays: 1, size: 0.6, end: 94 }], data: { randomMissing: 0.3 } },
  { id: 'G-gap', group: 'G', label: '6 consecutive missing days FD84–89, then FD90 episode', adapt: research, abnormal: [{ start: 90, rampDays: 1, size: 0.6, end: 94 }], data: { missingBlocks: [[84, 89]] } },
  { id: 'G-noise2x', group: 'G', label: 'Double measurement noise (SD 0.2 °C) + FD90 episode', adapt: research, abnormal: [{ start: 90, rampDays: 1, size: 0.6, end: 94 }], noiseSd: 0.2 },
  { id: 'G-outliers', group: 'G', label: '5% one-day sensor spikes of +1.0 °C + FD90 episode', adapt: research, abnormal: [{ start: 90, rampDays: 1, size: 0.6, end: 94 }], data: { outlierFraction: 0.05, outlierSize: 1.0 } },
  { id: 'G-sensorstep', group: 'G', label: 'Sensor replaced at FD50 reading +0.4 °C high (not physiological)', adapt: research, abnormal: [], data: { sensorStepAt: 50, sensorStepSize: 0.4 } },
  { id: 'G-sensordrift', group: 'G', label: 'Sensor drifts +0.01 °C/day from FD40 (not physiological)', adapt: research, abnormal: [], data: { sensorDriftFrom: 40, sensorDriftPerDay: 0.01 } },
  { id: 'G-everyother', group: 'G', label: 'Readings only every other day from FD40 + FD90 episode', adapt: research, abnormal: [{ start: 90, rampDays: 1, size: 0.6, end: 94 }], data: { everyOtherDayFrom: 40 } },
];
