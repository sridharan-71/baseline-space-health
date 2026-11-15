// "What if the astronaut is different?" scenarios for the stress test.
// Each one rewrites ONLY the simulated core-temperature series of the demo mission;
// noise, the planted episode and every other measure stay the same. All SIMULATED.
//
// Hypothetical individual variation: Stahn et al. 2017 reports a group mean of about +1 °C
// by ~FD75. Individual sizes and timings are NOT published in a form we use, so these
// scenarios are illustrative "what ifs", not research findings.
import type { MissionInput } from '../../domain/types';
import { DEMO_EVENT_DAYS, generateDemoMission } from './mission';

export interface Scenario {
  id: string;
  label: string;
  description: string;
  /** Size of her rise relative to the research group mean (+1.0 °C). */
  scale: number;
  /** Day her rise levels off. */
  plateauDay: number;
  hasEpisode: boolean;
  /** Optional slow, unexplained extra rise (no sudden episode): reaches `size` °C between `start` and `end`. */
  drift?: { start: number; end: number; size: number };
}

export const SCENARIOS: Scenario[] = [
  { id: 'group', label: 'Average adapter', description: 'Rises +1.0 °C by day 75 — exactly the research group mean. (The main demo.)', scale: 1.0, plateauDay: 75, hasEpisode: true },
  { id: 'half', label: 'Small adapter', description: 'Rises only +0.5 °C.', scale: 0.5, plateauDay: 75, hasEpisode: true },
  { id: 'strong', label: 'Large adapter', description: 'Rises +1.5 °C, ending above the 38 °C Earth line.', scale: 1.5, plateauDay: 75, hasEpisode: true },
  { id: 'fast', label: 'Fast adapter', description: 'Reaches +1.0 °C by day 30 instead of day 75.', scale: 1.0, plateauDay: 30, hasEpisode: true },
  { id: 'none', label: 'Non-adapter', description: 'Temperature does not rise in space at all.', scale: 0, plateauDay: 75, hasEpisode: true },
  { id: 'drift', label: 'Slow unexplained drift', description: 'Average adapter, then an extra +0.6 °C creeps in slowly from day 66 to day 96 — no sudden episode.', scale: 1.0, plateauDay: 75, hasEpisode: false, drift: { start: 66, end: 96, size: 0.6 } },
  { id: 'nonedrift', label: 'Non-adapter + slow drift', description: 'Temperature does not rise in space; then an extra +0.6 °C creeps in from day 40 to day 70 and stays (below 38 °C, so the Earth line never fires).', scale: 0, plateauDay: 75, hasEpisode: false, drift: { start: 40, end: 70, size: 0.6 } },
  { id: 'quiet', label: 'Average adapter, no problem', description: 'Same as the main demo but with no planted episode — every alert is a false alarm.', scale: 1.0, plateauDay: 75, hasEpisode: false },
];

const DEMO_PLATEAU = 75;
const shape = (day: number, plateau: number) => (day <= 0 ? 0 : Math.min(day / plateau, 1));

export function scenarioMission(s: Scenario, seed = 2026): MissionInput {
  const base = generateDemoMission(seed);
  const readings = base.readings.map((r) => {
    if (r.metricId !== 'coreTemp' || r.missionDay <= 0) return r;
    // Remove the demo curve, keep the noise / episode residual, add this scenario's curve.
    let v = r.value - shape(r.missionDay, DEMO_PLATEAU) + s.scale * shape(r.missionDay, s.plateauDay);
    if (!s.hasEpisode && DEMO_EVENT_DAYS.includes(r.missionDay)) {
      v = 36.75 + s.scale * shape(r.missionDay, s.plateauDay);
    }
    if (s.drift && r.missionDay > s.drift.start) {
      const { start, end, size } = s.drift;
      v += size * Math.min((r.missionDay - start) / (end - start), 1);
    }
    return { ...r, value: Math.round(v * 100) / 100 };
  });
  return { ...base, readings };
}
