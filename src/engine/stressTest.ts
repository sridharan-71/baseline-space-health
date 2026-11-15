// Stress test: does each way of judging temperature still work for a DIFFERENT astronaut?
// Runs the real engine on every scenario in data/simulated/scenarios.ts.
// "False alerts" = alerts on FD1–FD95, where the simulation contains no problem.
// "Episode caught" = planted problem days FD96, FD97, FD99 that were flagged (FD98 has no reading).
import { SCENARIOS, scenarioMission, type Scenario } from '../data/simulated/scenarios';
import type { MissionInput } from '../domain/types';
import { assessMetricDays } from './assess';
import { WATCH_Z } from './config';
import { compareLenses } from './lenses';
import { getReading } from './readings';

export const NORMAL_DAYS: [number, number] = [1, 95];
export const EPISODE_DAYS = [96, 97, 99];
/** Width of the rolling window used by the "recent days" comparison method (a common approach). */
export const ROLLING_WINDOW_DAYS = 14;

export interface MethodResult {
  /** Normal days flagged (any alert). */
  falseAlerts: number;
  /** Normal days escalated to "tell your medical officer" (BASELINE only). */
  falseMedicalAlerts: number | null;
  /** Planted-problem days flagged, out of EPISODE_DAYS.length (null when the scenario has no problem). */
  episodeCaught: number | null;
}

export interface StressRow {
  scenario: Scenario;
  /** Number of problem days with a reading (denominator for episodeCaught). */
  problemDaysWithData: number;
  earth: MethodResult;
  preflightOnly: MethodResult;
  rolling: MethodResult;
  baseline: MethodResult;
}

/** Problem days and problem-free days for a scenario. */
export function scenarioWindows(s: Scenario): { normal: [number, number]; problemDays: number[] } {
  if (s.drift) {
    // Drift: everything before it starts is problem-free; days 90–99 are deep into the drift.
    return { normal: [1, s.drift.start], problemDays: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99] };
  }
  return { normal: NORMAL_DAYS, problemDays: s.hasEpisode ? EPISODE_DAYS : [] };
}

/** Rolling-baseline method: compare each day with the mean/SD of the previous 14 in-flight days. */
export function rollingFlags(input: MissionInput, upToDay: number): Set<number> {
  const sdFloor = 0.1;
  const flags = new Set<number>();
  for (let d = 1; d <= upToDay; d++) {
    const r = getReading(input.readings, 'coreTemp', d);
    if (!r) continue;
    const prev: number[] = [];
    for (let k = d - ROLLING_WINDOW_DAYS; k < d; k++) {
      if (k === 0) continue;
      const p = getReading(input.readings, 'coreTemp', k);
      if (p) prev.push(p.value);
    }
    if (prev.length < 7) continue;
    const mean = prev.reduce((a, b) => a + b, 0) / prev.length;
    const sd = Math.max(sdFloor, Math.sqrt(prev.reduce((a, b) => a + (b - mean) ** 2, 0) / (prev.length - 1)));
    if ((r.value - mean) / sd >= WATCH_Z) flags.add(d);
  }
  return flags;
}

export function runStressTest(scenarios: Scenario[] = SCENARIOS): StressRow[] {
  return scenarios.map((scenario) => {
    const m = scenarioMission(scenario);
    const upTo = 99;
    const lens = compareLenses(m, 'coreTemp', upTo);
    const days = lens.perDay.filter((d) => d.value !== null && d.missionDay > 0);
    const win = scenarioWindows(scenario);
    const normal = days.filter((d) => d.missionDay >= win.normal[0] && d.missionDay <= win.normal[1]);
    const episode = days.filter((d) => win.problemDays.includes(d.missionDay));
    const roll = rollingFlags(m, upTo);
    const ep = (n: number) => (win.problemDays.length > 0 ? n : null);
    const statuses = assessMetricDays(m, 'coreTemp', normal.map((d) => d.missionDay));
    return {
      scenario,
      problemDaysWithData: episode.length,
      earth: {
        falseAlerts: normal.filter((d) => d.earthFlag).length,
        falseMedicalAlerts: null,
        episodeCaught: ep(episode.filter((d) => d.earthFlag).length),
      },
      preflightOnly: {
        falseAlerts: normal.filter((d) => d.preflightFlag).length,
        falseMedicalAlerts: null,
        episodeCaught: ep(episode.filter((d) => d.preflightFlag).length),
      },
      rolling: {
        falseAlerts: normal.filter((d) => roll.has(d.missionDay)).length,
        falseMedicalAlerts: null,
        episodeCaught: ep(episode.filter((d) => roll.has(d.missionDay)).length),
      },
      baseline: {
        falseAlerts: normal.filter((d) => d.baselineStatus === 'WATCH' || d.baselineStatus === 'ACT').length,
        falseMedicalAlerts: statuses.filter((a) => a.status === 'ACT').length,
        episodeCaught: ep(episode.filter((d) => d.baselineStatus === 'WATCH' || d.baselineStatus === 'ACT').length),
      },
    };
  });
}
