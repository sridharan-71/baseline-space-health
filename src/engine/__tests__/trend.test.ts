import { persistenceCount, unhealthyZ, windowDays } from '../trend';

describe('trend', () => {
  it('unhealthyZ for each direction', () => {
    expect(unhealthyZ(2, 'up')).toBe(2);
    expect(unhealthyZ(-2, 'up')).toBe(-2);
    expect(unhealthyZ(-2, 'down')).toBe(2);
    expect(unhealthyZ(-3, 'both')).toBe(3);
  });
  it('windowDays skips the gap', () => {
    expect(windowDays([95, 96, 97, 99], 99)).toEqual({ days: [96, 97, 99], missing: 1 });
  });
  it('never crosses into pre-flight', () => {
    expect(windowDays([-3, -2, -1, 1], 1)).toEqual({ days: [1], missing: 0 });
  });
  it('respects the lookback cap', () => {
    expect(windowDays([90, 99], 99)).toEqual({ days: [99], missing: 0 });
  });
  it('empty window', () => {
    expect(windowDays([], 50)).toEqual({ days: [], missing: 0 });
  });
  it('persistenceCount with a down metric, skipping NaN', () => {
    const z = new Map([[1, -2.5], [2, -1], [3, -2.1], [4, NaN]]);
    expect(persistenceCount(z, [1, 2, 3, 4], 'down')).toBe(2);
    expect(persistenceCount(z, [1, 2, 3, 4], 'up')).toBe(0);
    expect(persistenceCount(new Map(), [], 'up')).toBe(0);
  });
});
