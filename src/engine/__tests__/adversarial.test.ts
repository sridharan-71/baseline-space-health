// Regression tests from research/09_PERSONAL_CALIBRATION_AUDIT.md. All scenarios are HYPOTHETICAL
// simulations, run over several random seeds. They test algorithm behaviour, not clinical performance.
import { ADVERSARIAL_SCENARIOS, adversarialMission } from '../../data/simulated/adversarial';
import { evaluateScenario } from '../adversarialEval';
import { assessMetricDays } from '../assess';

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const sc = (id: string) => ADVERSARIAL_SCENARIOS.find((s) => s.id === id)!;
const summary = (id: string) => evaluateScenario(sc(id), SEEDS);

describe('calibration safeguards (adversarial, 10 seeds)', () => {
  it('an uncertain result is never shown as a reassuring OK, in any scenario or seed', () => {
    for (const s of ADVERSARIAL_SCENARIOS) {
      for (const seed of SEEDS.slice(0, 3)) {
        const { input } = adversarialMission(s, seed);
        const days = Array.from({ length: 120 }, (_, i) => i + 1);
        for (const a of assessMetricDays(input, 'coreTemp', days)) {
          if (a.adaptationUncertain) {
            expect(a.status).not.toBe('OK');
            expect(a.confidence).toBe('LOW');
          }
        }
      }
    }
  });

  it('FAILURE FOUND: non-adapter + slow drift below 38 °C is no longer silently absorbed', () => {
    const r = summary('B-none-drift');
    // Before the fix: 0% caught, never detected in 15/20 seeds, no uncertainty shown.
    expect(r.methods.baseline.neverDetected).toBe(0);
    expect(r.methods.baseline.lateCaughtFraction.mean).toBeGreaterThanOrEqual(0.9);
  });

  it('FAILURE FOUND: small adapter + late drift is flagged in its late phase', () => {
    expect(summary('B-small-latedrift').methods.baseline.lateCaughtFraction.mean).toBeGreaterThanOrEqual(0.7);
  });

  it('gradual drift on an average adapter is not absorbed late in the mission', () => {
    for (const id of ['A-30-0.6', 'A-50-0.6', 'B-30-0.5', 'B-20-0.8-slow', 'E-drift-5']) {
      expect(summary(id).methods.baseline.lateCaughtFraction.mean).toBeGreaterThanOrEqual(0.95);
    }
  });

  it('a sudden change that never resolves stays flagged (not absorbed)', () => {
    expect(summary('C-60-0.6-persist').methods.baseline.lateCaughtFraction.mean).toBe(1);
  });

  it('calibration contamination: repeated short episodes and sensor spikes barely move the estimate', () => {
    expect(summary('D-repeat').baseline.finalScale.max).toBeLessThan(1.1);
    expect(summary('C-60-0.6x5').baseline.finalScale.max).toBeLessThan(1.1);
    expect(summary('G-outliers').baseline.finalScale.max).toBeLessThan(1.15);
  });

  it('later episodes are still caught after earlier ones (repeated episodes)', () => {
    expect(summary('D-repeat').methods.baseline.caughtFraction.min).toBe(1);
  });

  it('early-mission problems are caught (research curve dominates early)', () => {
    for (const id of ['E-3', 'E-10', 'E-17']) expect(summary(id).methods.baseline.caughtFraction.mean).toBeGreaterThanOrEqual(0.95);
  });

  it('controls: few false alerts and no false "tell your medical officer" alerts', () => {
    for (const id of ['N1', 'N2']) {
      const r = summary(id);
      expect(r.methods.baseline.falseAlertDays.mean).toBeLessThan(1);
      expect(r.baseline.actOnNormalDays.max).toBe(0);
    }
  });

  it('missing data, gaps, every-other-day readings and double noise still catch the FD90 episode', () => {
    for (const id of ['G-missing30', 'G-gap', 'G-everyother', 'G-noise2x']) {
      expect(summary(id).methods.baseline.caughtFraction.mean).toBeGreaterThanOrEqual(0.95);
    }
  });

  it('a sensor step or sensor drift is flagged (as a change BASELINE cannot explain), not absorbed', () => {
    for (const id of ['G-sensorstep', 'G-sensordrift']) {
      expect(summary(id).methods.baseline.lateCaughtFraction.mean).toBeGreaterThanOrEqual(0.95);
    }
  });

  it('KNOWN LIMITATION (documented, not fixed): a small adapter whose drift starts before her own data outweighs the research prior looks like an average adapter', () => {
    // Temperature data alone cannot separate these. If this ever passes 0.5, update the docs.
    expect(summary('B-small-drift').methods.baseline.lateCaughtFraction.mean).toBeLessThan(0.5);
  });

  it('KNOWN COST: honest uncertainty means more "keep an eye on it" days for unusual adapters', () => {
    expect(summary('F-large').baseline.uncertainDays.mean).toBeGreaterThan(20);
    expect(summary('F-delayed').baseline.uncertainDays.mean).toBeGreaterThan(20);
  });
});

describe('chart band and assessment agree', () => {
  it('the expected band drawn on the chart uses the same uncertainty as the assessment', async () => {
    const { compareLenses } = await import('../lenses');
    const { generateDemoMission } = await import('../../data/simulated/mission');
    const m = generateDemoMission(2026);
    const lens = compareLenses(m, 'coreTemp', 99);
    const days = [20, 60, 97];
    const as = assessMetricDays(m, 'coreTemp', days);
    days.forEach((d, i) => {
      const ld = lens.perDay.find((x) => x.missionDay === d)!;
      const a = as[i]!;
      expect(ld.expectedValue!).toBeCloseTo(a.expected!.value, 6);
      const half = (ld.expectedHigh! - ld.expectedLow!) / 2;
      const sd = Math.sqrt(a.preflight.sd ** 2 + a.expected!.uncertainty ** 2);
      expect(half).toBeCloseTo(2 * sd, 6);
    });
  });
});
