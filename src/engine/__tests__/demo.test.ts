import { assessDay, assessMetric, buildCmoNote, compareLenses, METRIC_ORDER } from '../index';
import { generateDemoMission } from '../../data/simulated/mission';
import { BANNED } from './helpers';

const m = generateDemoMission(2026);

describe('DEMO_SCRIPT §3 invariants', () => {
  it('I3: FD1–FD95, all measures — BASELINE status is OK', () => {
    const bad: string[] = [];
    for (let d = 1; d <= 95; d++) {
      for (const id of METRIC_ORDER) {
        const a = assessMetric(m, id, d);
        if (a.status !== 'OK') bad.push(`${id} FD${d} ${a.status}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('I4: FD1–FD95 core temp — the pre-flight-only lens flags ≥ 60 days', () => {
    expect(compareLenses(m, 'coreTemp', 95).flagged.preflightOnly).toBeGreaterThanOrEqual(60);
  });

  it('I5: FD1–FD95 core temp and FD1–FD110 resting HR — the Earth lens flags 0 days', () => {
    expect(compareLenses(m, 'coreTemp', 95).flagged.earth).toBe(0);
    expect(compareLenses(m, 'restingHR', 110).flagged.earth).toBe(0);
  });

  it('I6: FD60 core temp — OK, pre-flight FLAG, expected-adaptation PASS citing Stahn 2017', () => {
    const a = assessMetric(m, 'coreTemp', 60);
    expect(a.status).toBe('OK');
    expect(a.zPreflight!).toBeGreaterThanOrEqual(2);
    const l2 = a.layers.find((l) => l.layer === 'PERSONAL_DEVIATION')!;
    const l3 = a.layers.find((l) => l.layer === 'EXPECTED_ADAPTATION')!;
    expect(l2.outcome).toBe('FLAG');
    expect(l3.outcome).toBe('PASS');
    expect(l3.evidenceIds).toContain('stahn2017');
  });

  it('I7: core temp — FD96 WATCH · FD97 ACT + Earth · FD98 UNKNOWN · FD99 ACT with MEDIUM confidence', () => {
    expect(assessMetric(m, 'coreTemp', 96).status).toBe('WATCH');
    const d97 = assessMetric(m, 'coreTemp', 97);
    expect(d97.status).toBe('ACT');
    expect(d97.earthCrossed).toBe(true);
    const d98 = assessMetric(m, 'coreTemp', 98);
    expect(d98.status).toBe('UNKNOWN');
    expect(d98.reasons).toContain('No reading for this day.');
    const d99 = assessMetric(m, 'coreTemp', 99);
    expect(d99.status).toBe('ACT');
    expect(d99.confidence).toBe('MEDIUM');
  });

  it('I8: FD97–FD99 resting HR and FD97 sleep — ACT', () => {
    for (const d of [97, 98, 99]) expect(assessMetric(m, 'restingHR', d).status, `FD${d}`).toBe('ACT');
    expect(assessMetric(m, 'sleepHours', 97).status).toBe('ACT');
  });

  it('I9: FD98 overall — ACT, unknownCount = 1', () => {
    const d = assessDay(m, 98);
    expect(d.overall).toBe('ACT');
    expect(d.unknownCount).toBe(1);
  });

  it('I10: FD99 — cmoSuggested and a complete, clean CMO note', () => {
    const day = assessDay(m, 99);
    expect(day.cmoSuggested).toBe(true);
    const note = buildCmoNote(day, m);
    for (const s of ['S —', 'B —', 'A —', 'R —', 'SIMULATED', 'Stahn et al. 2017', 'Core temperature estimate on FD98']) {
      expect(note).toContain(s);
    }
    expect(note).not.toMatch(BANNED);
  });
});

describe('banned-word scan over all engine output', () => {
  it('no headline, next step, reason or layer detail on any demo day uses banned words', () => {
    const hits: string[] = [];
    for (let d = -30; d <= 110; d++) {
      if (d === 0) continue;
      const day = assessDay(m, d);
      for (const a of day.metrics) {
        const strings = [a.headline, a.nextStep, ...a.reasons, ...a.confidenceReasons, ...a.layers.map((l) => l.detail)];
        for (const s of strings) if (BANNED.test(s)) hits.push(`FD${d} ${a.metricId}: ${s}`);
      }
      const note = buildCmoNote(day, m);
      if (BANNED.test(note)) hits.push(`note FD${d}`);
    }
    expect(hits).toEqual([]);
  });
});
