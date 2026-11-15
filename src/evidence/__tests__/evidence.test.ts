import { EVIDENCE } from '../sources';
import { ADAPTATION_MODELS, expectedOffset } from '../adaptation';
import { EARTH_REFERENCES, crossesEarthReference, getEarthReference } from '../references';

describe('evidence registry', () => {
  it('every referenced source id exists', () => {
    const ids = [...ADAPTATION_MODELS.flatMap((m) => m.sourceIds), ...EARTH_REFERENCES.map((r) => r.sourceId)];
    for (const id of ids) expect(EVIDENCE[id], id).toBeDefined();
  });
  it('every entry has population, finding and limitations', () => {
    for (const e of Object.values(EVIDENCE)) {
      expect(e.population.length).toBeGreaterThan(0);
      expect(e.finding.length).toBeGreaterThan(0);
      expect(e.limitations.length).toBeGreaterThan(0);
    }
  });
});

describe('adaptation', () => {
  it('coreTemp offsets follow the Stahn-shaped curve', () => {
    expect(expectedOffset('coreTemp', -5)).toBeNull();
    expect(expectedOffset('coreTemp', 0)).toBeNull();
    expect(expectedOffset('coreTemp', 37.5)!.offset).toBeCloseTo(0.5);
    expect(expectedOffset('coreTemp', 75)!.offset).toBeCloseTo(1.0);
    expect(expectedOffset('coreTemp', 100)!.offset).toBeCloseTo(1.0);
    expect(expectedOffset('coreTemp', 50)!.uncertainty).toBe(0.15);
  });
  it('no model for HR, sleep, mood', () => {
    expect(expectedOffset('restingHR', 50)).toBeNull();
    expect(expectedOffset('sleepHours', 50)).toBeNull();
    expect(expectedOffset('mood', 50)).toBeNull();
  });
});

describe('Earth references', () => {
  it('crossings respect inclusivity', () => {
    const t = getEarthReference('coreTemp')!;
    const h = getEarthReference('restingHR')!;
    expect(crossesEarthReference(t, 38.0)).toBe(true);
    expect(crossesEarthReference(t, 37.99)).toBe(false);
    expect(crossesEarthReference(h, 100)).toBe(false);
    expect(crossesEarthReference(h, 101)).toBe(true);
  });
  it('sleep and mood have no Earth reference', () => {
    expect(getEarthReference('sleepHours')).toBeNull();
    expect(getEarthReference('mood')).toBeNull();
  });
});
