import { assessDay, buildCmoNote } from '../index';
import { generateDemoMission } from '../../data/simulated/mission';

const m = generateDemoMission(2026);
const BANNED_WORDS = ['diagnos', 'disease', 'infection', 'fever', 'prescri', 'medicat', 'dose', 'dosing', 'treatment', 'mg'];

describe('buildCmoNote', () => {
  const note = buildCmoNote(assessDay(m, 99), m);
  it('has the SBAR sections and required content', () => {
    for (const s of ['SIMULATED', 'S —', 'B —', 'A —', 'R —', 'Stahn et al. 2017', 'Core temperature estimate on FD98']) {
      expect(note).toContain(s);
    }
    expect(note).toContain('Self-reported: fatigue, feeling hot.');
  });
  it('contains no banned words', () => {
    const lower = note.toLowerCase();
    for (const w of BANNED_WORDS) expect(lower, w).not.toContain(w);
  });
  it('says nothing is flagged on a quiet day', () => {
    const quiet = buildCmoNote(assessDay(m, 50), m);
    expect(quiet).toContain('Nothing flagged by BASELINE today.');
    expect(quiet).toContain('SIMULATED');
  });
});
