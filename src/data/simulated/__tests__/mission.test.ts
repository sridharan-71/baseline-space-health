import { generateDemoMission, DEMO_EVENT_DAYS } from '../mission';
import { validateReading } from '../../../domain/validation';
import type { MetricId } from '../../../domain/types';

const METRIC_IDS: MetricId[] = ['coreTemp', 'restingHR', 'sleepHours', 'mood'];
const find = (m: ReturnType<typeof generateDemoMission>, id: MetricId, d: number) =>
  m.readings.find((r) => r.metricId === id && r.missionDay === d);

describe('generateDemoMission', () => {
  const m = generateDemoMission(2026);

  it('I1: same seed gives an identical mission', () => {
    expect(generateDemoMission(2026)).toEqual(m);
  });

  it('different seed changes normal days but not the planted episode', () => {
    const other = generateDemoMission(7);
    const normal = (x: typeof m) => x.readings.filter((r) => !DEMO_EVENT_DAYS.includes(r.missionDay)).map((r) => r.value);
    expect(normal(other)).not.toEqual(normal(m));
    const ep = (x: typeof m) => x.readings.filter((r) => DEMO_EVENT_DAYS.includes(r.missionDay));
    expect(ep(other)).toEqual(ep(m));
  });

  it('I2: every measure present on L-30…L-1 and FD1…FD110 except coreTemp FD98', () => {
    const missing: string[] = [];
    for (let d = -30; d <= 110; d++) {
      if (d === 0) continue;
      for (const id of METRIC_IDS) if (!find(m, id, d)) missing.push(`${id}@${d}`);
    }
    expect(missing).toEqual(['coreTemp@98']);
  });

  it('has no reading on day 0', () => {
    expect(m.readings.some((r) => r.missionDay === 0)).toBe(false);
  });

  it('every reading passes validation', () => {
    for (const r of m.readings) expect(validateReading(r).ok).toBe(true);
  });

  it('planted FD97 values', () => {
    expect(find(m, 'coreTemp', 97)!.value).toBeCloseTo(38.4, 2);
    expect(find(m, 'restingHR', 97)!.value).toBe(71);
  });

  it('in-flight normal coreTemp stays within ±0.15 of the curve', () => {
    for (const r of m.readings) {
      if (r.metricId !== 'coreTemp' || r.missionDay <= 0 || DEMO_EVENT_DAYS.includes(r.missionDay)) continue;
      const curve = 36.75 + Math.min(r.missionDay / 75, 1);
      expect(Math.abs(r.value - curve)).toBeLessThanOrEqual(0.15 + 1e-9);
    }
  });

  it('self-reports on FD97–99 contain fatigue', () => {
    for (const d of [97, 98, 99]) {
      expect(m.selfReports.find((s) => s.missionDay === d)!.symptoms).toContain('fatigue');
    }
  });

  it('currentDay is 99 and the astronaut is simulated', () => {
    expect(m.currentDay).toBe(99);
    expect(m.astronaut.isSimulated).toBe(true);
  });
});
