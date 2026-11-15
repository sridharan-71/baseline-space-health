import { compareLenses } from '../index';
import { generateDemoMission } from '../../data/simulated/mission';

const m = generateDemoMission(2026);

describe('compareLenses', () => {
  it('counts only in-flight days with data', () => {
    const t = compareLenses(m, 'coreTemp', 99);
    expect(t.daysEvaluated).toBe(98); // FD1–FD99 minus the FD98 gap
    const hr = compareLenses(m, 'restingHR', 99);
    expect(hr.daysEvaluated).toBe(99);
  });
  it('perDay covers L-30…upToDay, skipping launch day', () => {
    const t = compareLenses(m, 'coreTemp', 99);
    expect(t.perDay[0]!.missionDay).toBe(-30);
    expect(t.perDay.at(-1)!.missionDay).toBe(99);
    expect(t.perDay.some((d) => d.missionDay === 0)).toBe(false);
    expect(t.perDay.find((d) => d.missionDay === 98)!.value).toBeNull();
    expect(t.perDay.find((d) => d.missionDay === -5)!.expectedLow).toBeNull();
  });
  it('restingHR Earth count is 0; sleep Earth is null', () => {
    expect(compareLenses(m, 'restingHR', 110).flagged.earth).toBe(0);
    expect(compareLenses(m, 'sleepHours').flagged.earth).toBeNull();
  });
  it('pre-flight-only flags coreTemp on ≥ 60 days up to FD95, BASELINE on none', () => {
    const t = compareLenses(m, 'coreTemp', 95);
    expect(t.flagged.preflightOnly).toBeGreaterThanOrEqual(60);
    expect(t.flagged.baseline).toBe(0);
    expect(t.flagged.earth).toBe(0);
  });
});
