import type { LensComparison, LensDay, MetricId, MissionInput } from '../domain/types';
import { phaseOf } from '../domain/phase';
import { METRICS } from '../domain/metrics';
import { getAdaptationModel } from '../evidence/adaptation';
import { crossesEarthReference, getEarthReference } from '../evidence/references';
import { assessMetricDays } from './assess';
import { computePreflightBaseline } from './baseline';
import { WATCH_Z } from './config';
import { firstDay, getReading } from './readings';
import { unhealthyZ } from './trend';

const DEFAULT_FIRST_DAY = -30;

export function compareLenses(input: MissionInput, metricId: MetricId, upToDay: number = input.currentDay): LensComparison {
  const def = METRICS[metricId];
  const baseline = computePreflightBaseline(input.readings, metricId);
  const model = getAdaptationModel(metricId);
  const ref = getEarthReference(metricId);
  const start = Math.min(firstDay(input.readings, metricId) ?? DEFAULT_FIRST_DAY, DEFAULT_FIRST_DAY);

  const days: number[] = [];
  for (let d = start; d <= upToDay; d++) if (d !== 0) days.push(d);
  const assessments = assessMetricDays(input, metricId, days);

  const preflightLow = baseline.mean - WATCH_Z * baseline.sd;
  const preflightHigh = baseline.mean + WATCH_Z * baseline.sd;

  let earth = 0;
  let preflightOnly = 0;
  let baselineFlags = 0;
  let daysEvaluated = 0;

  const perDay: LensDay[] = days.map((day, i) => {
    const a = assessments[i]!;
    const r = getReading(input.readings, metricId, day);
    const value = r ? r.value : null;
    const zPre = value === null || baseline.n === 0 ? null : (value - baseline.mean) / baseline.sd;
    const preflightFlag = zPre === null ? null : unhealthyZ(zPre, def.unhealthyDirection) >= WATCH_Z;
    const earthFlag = ref === null || value === null ? null : crossesEarthReference(ref, value);

    let expectedValue: number | null = null;
    let expectedLow: number | null = null;
    let expectedHigh: number | null = null;
    if (model && day > 0 && baseline.n > 0) {
      const combinedSd = Math.sqrt(baseline.sd ** 2 + model.uncertainty ** 2);
      expectedValue = baseline.mean + model.offset(day);
      expectedLow = expectedValue - WATCH_Z * combinedSd;
      expectedHigh = expectedValue + WATCH_Z * combinedSd;
    }

    if (phaseOf(day) === 'INFLIGHT' && value !== null) {
      daysEvaluated++;
      if (earthFlag) earth++;
      if (preflightFlag) preflightOnly++;
      if (a.status === 'WATCH' || a.status === 'ACT') baselineFlags++;
    }

    return {
      missionDay: day,
      value,
      earthFlag,
      preflightFlag,
      baselineStatus: a.status,
      preflightLow,
      preflightHigh,
      expectedLow,
      expectedHigh,
      expectedValue,
    };
  });

  return {
    metricId,
    daysEvaluated,
    flagged: { earth: ref ? earth : null, preflightOnly, baseline: baselineFlags },
    perDay,
  };
}
