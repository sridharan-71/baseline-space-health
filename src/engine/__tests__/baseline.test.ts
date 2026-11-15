import { computePreflightBaseline } from '../baseline';
import { generateDemoMission } from '../../data/simulated/mission';
import type { Reading } from '../../domain/types';

const r = (missionDay: number, value: number, source: Reading['source'] = 'SIMULATED'): Reading => ({
  metricId: 'restingHR',
  missionDay,
  value,
  source,
});

describe('computePreflightBaseline', () => {
  it('known numbers: [55, 60, 65] → mean 60, sd 5', () => {
    const b = computePreflightBaseline([r(-3, 55), r(-2, 60), r(-1, 65)], 'restingHR');
    expect(b).toEqual({ mean: 60, sd: 5, n: 3 });
  });
  it('[1, 2, 3]-shaped spread → mean 2, sd 1 (sleep, floor 0.3)', () => {
    const rs: Reading[] = [1, 2, 3].map((v, i) => ({ metricId: 'sleepHours', missionDay: -3 + i, value: v, source: 'SIMULATED' }));
    expect(computePreflightBaseline(rs, 'sleepHours')).toEqual({ mean: 2, sd: 1, n: 3 });
  });
  it('applies the SD floor', () => {
    const b = computePreflightBaseline([r(-3, 60), r(-2, 60), r(-1, 60)], 'restingHR');
    expect(b.sd).toBe(2);
  });
  it('n < 2 → sdFloor; n = 0 → NaN mean', () => {
    expect(computePreflightBaseline([r(-1, 60)], 'restingHR')).toEqual({ mean: 60, sd: 2, n: 1 });
    const empty = computePreflightBaseline([], 'restingHR');
    expect(empty.n).toBe(0);
    expect(Number.isNaN(empty.mean)).toBe(true);
    expect(empty.sd).toBe(2);
  });
  it('ignores in-flight readings', () => {
    expect(computePreflightBaseline([r(-2, 55), r(-1, 65), r(5, 120)], 'restingHR').n).toBe(2);
  });
  it('USER_ENTERED overrides SIMULATED on the same day', () => {
    const b = computePreflightBaseline([r(-2, 60), r(-1, 60), r(-1, 70, 'USER_ENTERED')], 'restingHR');
    expect(b.mean).toBe(65);
  });
  it('demo mission coreTemp: n 30, mean ≈ 36.75', () => {
    const b = computePreflightBaseline(generateDemoMission(2026).readings, 'coreTemp');
    expect(b.n).toBe(30);
    expect(Math.abs(b.mean - 36.75)).toBeLessThan(0.05);
  });
});
