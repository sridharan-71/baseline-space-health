import { assessDay, assessMetric } from '../index';
import { ADAPTATION_MODELS } from '../../evidence/adaptation';
import { alt, mission } from './helpers';

const hr = (flight: Record<number, number>, pre = alt(30, 60, 2)) => mission('restingHR', pre, flight);

describe('assessMetric — status paths', () => {
  it('UNKNOWN when today has no reading', () => {
    const a = assessMetric(hr({ 1: 60 }), 'restingHR', 2);
    expect(a.status).toBe('UNKNOWN');
    expect(a.confidence).toBe('LOW');
    expect(a.reasons).toContain('No reading for this day.');
    expect(a.layers[0]!.outcome).toBe('FAIL');
    expect(a.layers.slice(1).every((l) => l.outcome === 'NOT_APPLICABLE')).toBe(true);
    expect(a.nextStep).toBe('Take or re-take this reading.');
  });
  it('UNKNOWN when the baseline has fewer than 7 days', () => {
    const a = assessMetric(hr({ 1: 60 }, alt(5, 60, 2)), 'restingHR', 1);
    expect(a.status).toBe('UNKNOWN');
    expect(a.headline).toMatch(/not enough data — Only 5 pre-flight readings/);
  });
  it('OK with no model', () => {
    const a = assessMetric(hr({ 1: 61 }), 'restingHR', 1);
    expect(a.status).toBe('OK');
    expect(a.confidence).toBe('HIGH');
    expect(a.layers[2]!.outcome).toBe('NOT_APPLICABLE');
    expect(a.headline).toBe('Resting heart rate: within your expected range.');
    expect(a.nextStep).toBe('No action needed.');
  });
  it('OK with adaptation even though pre-flight z is high', () => {
    const m = mission('coreTemp', alt(30, 36.75, 0.1), { 60: 37.55 });
    const a = assessMetric(m, 'coreTemp', 60);
    expect(a.status).toBe('OK');
    expect(a.layers[1]!.outcome).toBe('FLAG');
    expect(a.layers[2]!.outcome).toBe('PASS');
    expect(a.layers[2]!.evidenceIds).toContain('stahn2017');
    expect(a.headline).toMatch(/above your pre-flight normal, but within the expected in-flight range for FD60/);
  });
  it('WATCH on a single day', () => {
    const a = assessMetric(hr({ 1: 60, 2: 60, 3: 65 }), 'restingHR', 3);
    expect(a.status).toBe('WATCH');
    expect(a.persistence.flaggedOfLastAvailable).toBe(1);
    expect(a.headline).toMatch(/outside your expected range today \(65 vs expected 60\.0 ± 4\.1 bpm\)/);
    expect(a.nextStep).toBe('Re-check within 24 h. Note how you feel.');
  });
  it('ACT with persistence', () => {
    const a = assessMetric(hr({ 1: 60, 2: 66, 3: 66 }), 'restingHR', 3);
    expect(a.status).toBe('ACT');
    expect(a.headline).toBe('Resting heart rate: outside your expected range on 2 of the last 3 available days.');
    expect(a.nextStep).toMatch(/Contact your crew medical officer/);
  });
  it('ACT via Earth crossings even when z is small', () => {
    const a = assessMetric(hr({ 1: 101, 2: 101 }, alt(30, 98, 2)), 'restingHR', 2);
    expect(a.zExpected!).toBeLessThan(2);
    expect(a.status).toBe('ACT');
    expect(a.earthCrossed).toBe(true);
  });
  it('WATCH via cool-down after an ACT day', () => {
    const a = assessMetric(hr({ 1: 66, 2: 66, 3: 60 }), 'restingHR', 3);
    expect(a.status).toBe('WATCH');
    expect(a.reasons).toContain('Recently ACT — keep checking.');
  });
  it('a down metric (sleep) flags short sleep, not long sleep', () => {
    const short = mission('sleepHours', alt(30, 6.6, 0.3), { 1: 5.8, 2: 5.8 });
    expect(assessMetric(short, 'sleepHours', 2).status).toBe('ACT');
    const long = mission('sleepHours', alt(30, 6.6, 0.3), { 1: 7.8, 2: 7.8 });
    expect(assessMetric(long, 'sleepHours', 2).status).toBe('OK');
  });
  it('never throws on junk input', () => {
    const bad = { astronaut: { id: 'x', displayName: 'x', isSimulated: true }, readings: null, selfReports: [], currentDay: 1 } as never;
    const a = assessMetric(bad, 'coreTemp', 1);
    expect(a.status).toBe('UNKNOWN');
    expect(a.reasons).toContain('Could not assess this reading.');
  });
});

describe('assessMetric — confidence', () => {
  it('steps down for a small baseline (n < 14)', () => {
    const a = assessMetric(hr({ 1: 60 }, alt(10, 60, 2)), 'restingHR', 1);
    expect(a.confidence).toBe('MEDIUM');
    expect(a.confidenceReasons[0]).toMatch(/Only 10 pre-flight readings/);
  });
  it('steps down for a missing day in the window', () => {
    const a = assessMetric(hr({ 1: 60, 3: 60 }), 'restingHR', 3);
    expect(a.persistence.missingInWindow).toBe(1);
    expect(a.confidence).toBe('MEDIUM');
  });
  it('steps down for a LOW-evidence model, and floors at LOW', () => {
    ADAPTATION_MODELS.push({
      id: 'test-low', metricId: 'restingHR', sourceIds: ['prototypeRules'], evidenceStrength: 'LOW',
      summary: 'test', designAssumptions: [], offset: () => 0, uncertainty: 0,
    });
    try {
      expect(assessMetric(hr({ 1: 60 }), 'restingHR', 1).confidence).toBe('MEDIUM');
      // LOW model + small baseline + missing day → three step-downs, floored at LOW
      expect(assessMetric(hr({ 1: 60, 3: 60 }, alt(10, 60, 2)), 'restingHR', 3).confidence).toBe('LOW');
    } finally {
      ADAPTATION_MODELS.pop();
    }
  });
});

describe('assessDay', () => {
  it('rolls up to the worst known status and counts unknowns', () => {
    const d = assessDay(hr({ 1: 60, 2: 66, 3: 66 }), 3);
    expect(d.overall).toBe('ACT');
    expect(d.unknownCount).toBe(3);
    expect(d.cmoSuggested).toBe(true);
  });
  it('UNKNOWN only when every measure is unknown', () => {
    expect(assessDay(hr({ 1: 60 }), 2).overall).toBe('UNKNOWN');
    expect(assessDay(hr({ 1: 60 }), 1).overall).toBe('OK');
  });
  it('cmoSuggested: WATCH needs symptoms', () => {
    const noSym = hr({ 1: 60, 2: 60, 3: 65 });
    expect(assessDay(noSym, 3).overall).toBe('WATCH');
    expect(assessDay(noSym, 3).cmoSuggested).toBe(false);
    const withSym = { ...noSym, selfReports: [{ missionDay: 3, symptoms: ['fatigue' as const], source: 'SIMULATED' as const }] };
    expect(assessDay(withSym, 3).cmoSuggested).toBe(true);
  });
  it('prefers a USER_ENTERED self-report', () => {
    const m = hr({ 1: 60 });
    m.selfReports = [
      { missionDay: 1, symptoms: ['fatigue'], source: 'USER_ENTERED' },
      { missionDay: 1, symptoms: [], source: 'SIMULATED' },
    ];
    expect(assessDay(m, 1).selfReport!.symptoms).toEqual(['fatigue']);
  });
});
