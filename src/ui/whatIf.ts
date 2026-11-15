import { assessMetric, type MetricAssessment, type MetricId, type MissionInput } from '../engine/index';

/**
 * Runs the real engine on a copy of the mission where one reading is replaced.
 * Used for "same number, different meaning": nothing here is hard-coded.
 */
export function assessWhatIf(input: MissionInput, metricId: MetricId, day: number, value: number): MetricAssessment {
  const readings = [
    ...input.readings.filter((r) => !(r.metricId === metricId && r.missionDay === day)),
    { metricId, missionDay: day, value, source: 'SIMULATED' as const },
  ];
  return assessMetric({ ...input, readings }, metricId, day);
}
