import { checkDataQuality } from '../quality';

const reading = { metricId: 'coreTemp' as const, missionDay: 3, value: 37, source: 'SIMULATED' as const };

describe('checkDataQuality', () => {
  it('missing reading fails', () => {
    const q = checkDataQuality({ baseline: { mean: 36.7, sd: 0.1, n: 30 }, reading: null, metricId: 'coreTemp' });
    expect(q.ok).toBe(false);
    expect(q.reasons).toEqual(['No reading for this day.']);
  });
  it('small baseline fails', () => {
    const q = checkDataQuality({ baseline: { mean: 36.7, sd: 0.1, n: 3 }, reading, metricId: 'coreTemp' });
    expect(q.ok).toBe(false);
    expect(q.reasons[0]).toMatch(/Only 3 pre-flight readings \(need 7\)/);
  });
  it('collects both reasons', () => {
    const q = checkDataQuality({ baseline: { mean: 36.7, sd: 0.1, n: 3 }, reading: null, metricId: 'coreTemp' });
    expect(q.reasons).toHaveLength(2);
  });
  it('implausible value fails defensively', () => {
    const q = checkDataQuality({ baseline: { mean: 36.7, sd: 0.1, n: 30 }, reading: { ...reading, value: 50 }, metricId: 'coreTemp' });
    expect(q.reasons).toContain('Reading outside plausible range.');
  });
  it('good data passes', () => {
    expect(checkDataQuality({ baseline: { mean: 36.7, sd: 0.1, n: 30 }, reading, metricId: 'coreTemp' }).ok).toBe(true);
  });
});
