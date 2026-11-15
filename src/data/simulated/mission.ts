import { validateReading } from '../../domain/validation';
import type { MetricId, MissionInput, Reading, SelfReport } from '../../domain/types';
import { clampedGaussian, mulberry32 } from './rng';

export const DEMO_EVENT_DAYS = [96, 97, 98, 99, 100];
export const DEMO_GAP: { metricId: MetricId; missionDay: number } = { metricId: 'coreTemp', missionDay: 98 };

const PREFLIGHT_FIRST = -30;
const INFLIGHT_LAST = 110;
const CURRENT_DAY = 99;

const TEMP_PRE = 36.75;
// Simulation choice, mirrors the cited curve (Stahn et al. 2017 group mean: +1.0 °C by ~FD75, then flat).
const tempShape = (day: number) => (day <= 0 ? 0 : 1.0 * Math.min(day / 75, 1));

// Planted episode — exact values, no noise.
const EPISODE_TEMP_RESIDUAL: Record<number, number | null> = { 96: 0.45, 97: 0.65, 98: null, 99: 0.6, 100: 0.3 };
const EPISODE_HR: Record<number, number> = { 96: 64, 97: 71, 98: 72, 99: 70, 100: 64 };
const EPISODE_SLEEP: Record<number, number> = { 96: 5.8, 97: 5.2, 98: 5.1, 99: 5.4, 100: 6.0 };
const EPISODE_MOOD: Record<number, number> = { 96: 3, 97: 2, 98: 2, 99: 3, 100: 4 };
const SYMPTOM_DAYS = [97, 98, 99];

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

export function generateDemoMission(seed = 2026): MissionInput {
  const rng = mulberry32(seed);
  const readings: Reading[] = [];
  const selfReports: SelfReport[] = [];
  const push = (metricId: MetricId, missionDay: number, value: number) =>
    readings.push({ metricId, missionDay, value, source: 'SIMULATED' });

  const days: number[] = [];
  for (let d = PREFLIGHT_FIRST; d <= INFLIGHT_LAST; d++) if (d !== 0) days.push(d);

  for (const day of days) {
    // Always draw the noise so normal days do not depend on where the episode sits.
    const tNoise = clampedGaussian(rng, 0.1, 0.15);
    const hNoise = clampedGaussian(rng, 2.5, 3.0);
    const sNoise = clampedGaussian(rng, 0.3, 0.35);
    const moodDraw = rng();

    const inEpisode = DEMO_EVENT_DAYS.includes(day);
    if (inEpisode) {
      const resid = EPISODE_TEMP_RESIDUAL[day];
      if (resid !== null && resid !== undefined) push('coreTemp', day, round(TEMP_PRE + 1.0 + resid, 2));
      push('restingHR', day, EPISODE_HR[day]!);
      push('sleepHours', day, EPISODE_SLEEP[day]!);
      push('mood', day, EPISODE_MOOD[day]!);
    } else {
      // Round to 2 decimals but keep the result inside the ±0.15 °C noise band.
      const curve = TEMP_PRE + tempShape(day);
      const t = Math.min(Math.floor((curve + 0.15) * 100) / 100, Math.max(Math.ceil((curve - 0.15) * 100) / 100, round(curve + tNoise, 2)));
      push('coreTemp', day, t);
      push('restingHR', day, Math.round(58 + hNoise));
      push('sleepHours', day, round((day < 0 ? 6.6 : 6.55) + sNoise, 1));
      push('mood', day, moodDraw < 0.75 ? 4 : 5);
    }

    if (day > 0) {
      selfReports.push(
        SYMPTOM_DAYS.includes(day)
          ? { missionDay: day, symptoms: ['fatigue', 'feeling_hot'], note: 'SIMULATED self-report', source: 'SIMULATED' }
          : { missionDay: day, symptoms: [], source: 'SIMULATED' },
      );
    }
  }

  for (const r of readings) {
    const res = validateReading(r);
    if (!res.ok) {
      throw new Error(`Simulated reading failed validation: ${r.metricId} day ${r.missionDay} value ${r.value} — ${res.errors.join('; ')}`);
    }
  }

  return {
    astronaut: { id: 'SIM-01', displayName: 'Cmdr. Asha Rao (SIMULATED)', isSimulated: true },
    readings,
    selfReports,
    currentDay: CURRENT_DAY,
  };
}
