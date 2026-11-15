import { runStressTest } from '../index';

const rows = runStressTest();
const row = (id: string) => rows.find((r) => r.scenario.id === id)!;

describe('stress test — individual variation (SIMULATED scenarios)', () => {
  it('average adapter: no false alerts and the planted problem is caught', () => {
    expect(row('group').baseline.falseAlerts).toBe(0);
    expect(row('group').baseline.episodeCaught).toBe(3);
  });
  it('small adapter: the problem is NOT hidden inside the expected band (personal calibration)', () => {
    expect(row('half').baseline.episodeCaught).toBeGreaterThanOrEqual(2);
    expect(row('half').baseline.falseAlerts).toBe(0);
  });
  it('non-adapter: the problem is still caught on most days', () => {
    expect(row('none').baseline.episodeCaught).toBeGreaterThanOrEqual(2);
  });
  it('large adapter: Earth-line crossings show as WATCH but never escalate to the medical officer on normal days', () => {
    expect(row('strong').baseline.falseMedicalAlerts).toBe(0);
    // Extra WATCH days come from the "can't tell" safeguard: her adaptation is bigger than the research average.
    expect(row('strong').baseline.falseAlerts).toBeGreaterThanOrEqual(row('strong').earth.falseAlerts);
  });
  it('quiet mission: BASELINE raises no alerts, the pre-flight-only method raises many', () => {
    expect(row('quiet').baseline.falseAlerts).toBe(0);
    expect(row('quiet').baseline.episodeCaught).toBeNull();
    expect(row('quiet').preflightOnly.falseAlerts).toBeGreaterThan(50);
  });
  it('slow unexplained drift: BASELINE catches it, a 14-day rolling baseline adapts to it and misses it', () => {
    const d = row('drift');
    expect(d.baseline.episodeCaught).toBe(d.problemDaysWithData);
    expect(d.baseline.falseAlerts).toBe(0);
    expect(d.rolling.episodeCaught).toBeLessThan(d.problemDaysWithData / 2);
  });
  it('known limitation is reported honestly: a fast adapter produces false alerts', () => {
    // We only personalise the SIZE of the change, not its timing. This test documents the weakness.
    expect(row('fast').baseline.falseAlerts).toBeGreaterThan(0);
  });
});

describe('stress test — non-adapter + slow drift (the case the Earth line cannot see)', () => {
  it('Earth line misses it, rolling baseline misses it, BASELINE flags it', () => {
    const r = runStressTest().find((x) => x.scenario.id === 'nonedrift')!;
    expect(r.earth.episodeCaught).toBe(0);
    expect(r.rolling.episodeCaught).toBeLessThan(r.problemDaysWithData / 2);
    expect(r.baseline.episodeCaught).toBe(r.problemDaysWithData);
  });
});
