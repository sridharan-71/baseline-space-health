import { availableDays, getReading } from '../readings';
import type { Reading } from '../../domain/types';

describe('readings', () => {
  it('prefers USER_ENTERED over SIMULATED, then the last one', () => {
    const rs: Reading[] = [
      { metricId: 'restingHR', missionDay: 5, value: 60, source: 'USER_ENTERED' },
      { metricId: 'restingHR', missionDay: 5, value: 61, source: 'SIMULATED' },
      { metricId: 'restingHR', missionDay: 5, value: 62, source: 'USER_ENTERED' },
      { metricId: 'restingHR', missionDay: 5, value: 63, source: 'SIMULATED' },
    ];
    expect(getReading(rs, 'restingHR', 5)!.value).toBe(62);
    const sims: Reading[] = [
      { metricId: 'restingHR', missionDay: 5, value: 60, source: 'SIMULATED' },
      { metricId: 'restingHR', missionDay: 5, value: 61, source: 'SIMULATED' },
    ];
    expect(getReading(sims, 'restingHR', 5)!.value).toBe(61);
  });
  it('ignores invalid readings', () => {
    const rs: Reading[] = [
      { metricId: 'coreTemp', missionDay: 5, value: 36.9, source: 'SIMULATED' },
      { metricId: 'coreTemp', missionDay: 5, value: 99, source: 'USER_ENTERED' },
      { metricId: 'coreTemp', missionDay: 0, value: 36.9, source: 'SIMULATED' },
    ];
    expect(getReading(rs, 'coreTemp', 5)!.value).toBe(36.9);
    expect(getReading(rs, 'coreTemp', 0)).toBeNull();
    expect(availableDays(rs, 'coreTemp', -5, 10)).toEqual([5]);
  });
});
