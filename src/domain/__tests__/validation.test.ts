import { validateReading, validateSelfReport } from '../validation';

const good = { coreTemp: 36.8, restingHR: 60, sleepHours: 6.5, mood: 4 } as const;

describe('validateReading', () => {
  for (const [metricId, value] of Object.entries(good)) {
    it(`accepts a valid ${metricId} reading`, () => {
      const r = validateReading({ metricId, missionDay: 5, value, source: 'SIMULATED' });
      expect(r.ok).toBe(true);
    });
  }
  const base = { metricId: 'coreTemp', missionDay: 5, value: 36.8, source: 'SIMULATED' };
  const bad: [string, object][] = [
    ['unknown metric', { ...base, metricId: 'glucose' }],
    ['NaN', { ...base, value: NaN }],
    ['Infinity', { ...base, value: Infinity }],
    ['out-of-range value', { ...base, value: 99 }],
    ['day 0', { ...base, missionDay: 0 }],
    ['non-integer day', { ...base, missionDay: 1.5 }],
    ['day out of range', { ...base, missionDay: 401 }],
    ['non-integer mood', { ...base, metricId: 'mood', value: 3.5 }],
    ['bad source', { ...base, source: 'WEB' }],
  ];
  for (const [name, r] of bad) {
    it(`rejects ${name}`, () => {
      const res = validateReading(r);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.errors.length).toBeGreaterThan(0);
    });
  }
  it('never throws on junk', () => {
    expect(validateReading(null).ok).toBe(false);
    expect(validateReading('x').ok).toBe(false);
  });
});

describe('validateSelfReport', () => {
  it('accepts a valid report', () => {
    expect(validateSelfReport({ missionDay: 3, symptoms: ['fatigue'], source: 'USER_ENTERED' }).ok).toBe(true);
  });
  it('rejects a bad symptom', () => {
    expect(validateSelfReport({ missionDay: 3, symptoms: ['sneezing'], source: 'USER_ENTERED' }).ok).toBe(false);
  });
  it('rejects a note longer than 500 chars', () => {
    expect(validateSelfReport({ missionDay: 3, symptoms: [], note: 'x'.repeat(501), source: 'USER_ENTERED' }).ok).toBe(false);
  });
  it('rejects day 0 and bad source', () => {
    expect(validateSelfReport({ missionDay: 0, symptoms: [], source: 'USER_ENTERED' }).ok).toBe(false);
    expect(validateSelfReport({ missionDay: 2, symptoms: [], source: 'NOPE' }).ok).toBe(false);
  });
});
