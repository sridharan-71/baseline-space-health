// Personal calibration of a research adaptation curve — with safeguards.
//
// Why: the research curve (e.g. Stahn et al. 2017) is a GROUP MEAN of 11 astronauts; individuals differ.
//
// Method (one-parameter shrinkage estimate, deliberately simple and explainable):
//   expected offset(day) = scale × researchOffset(day)
//   scale = (Σ x·g + w0·1) / (Σ g² + w0)
// over her in-flight days up to CALIBRATION_EXCLUDE_RECENT_DAYS ago, where
//   x = her reading − her pre-flight mean,  g = researchOffset(that day),  w0 = CALIBRATION_PRIOR_WEIGHT.
//
// Known weakness (found in research/09_PERSONAL_CALIBRATION_AUDIT.md): a SLOW unexplained rise is
// statistically indistinguishable from a bigger or later adaptation, so the estimate can creep up and
// absorb it. Safeguards here and in assess.ts:
//   1. One-sided trimming: days ≥ CALIBRATION_TRIM_Z combined SDs ABOVE a first-pass estimate are not
//      used to learn "normal" (stops short episodes and spikes contaminating the estimate).
//   2. Consistency check: compares the adaptation size implied by her early in-flight data with that
//      implied by her most recent data. A big increase means the rise does not follow the research
//      timing; assess.ts turns it into an explicit "can't tell" state instead of a reassuring OK.
// All constants are prototype design assumptions (engine/config.ts).

import type { MetricId, MissionInput } from '../domain/types';
import type { AdaptationModel } from '../evidence/adaptation';
import {
  CALIBRATION_EXCLUDE_RECENT_DAYS,
  CALIBRATION_PRIOR_WEIGHT,
  CALIBRATION_RISE_LOOKBACK_DAYS,
  CALIBRATION_SCALE_MAX,
  CALIBRATION_SCALE_MIN,
  CALIBRATION_TRIM_Z,
} from './config';
import { getReading } from './readings';

export interface Calibration {
  scale: number;
  daysUsed: number;
  /** Σg² of the data used: how much evidence the data carries compared with the prior (w0). */
  dataWeight: number;
  /** Days left out because they were far above the expectation. */
  trimmedDays: number;
  /** True once her own data outweighs the research prior (dataWeight ≥ w0). */
  established: boolean;
  /**
   * Consistency check: adaptation size implied by her EARLY in-flight data vs her most RECENT
   * CALIBRATION_RISE_LOOKBACK_DAYS of eligible data (plain least squares, no research prior).
   * null until both windows carry enough evidence (Σg² ≥ CONSISTENCY_MIN_WEIGHT).
   * A real adaptation that follows the research timing gives similar values; a slow unexplained
   * change, a late adaptation or a sensor fault gives recent > early.
   */
  consistency: { early: number; recent: number } | null;
}

/** Evidence needed in each window before the consistency check is trusted (PROTOTYPE DESIGN ASSUMPTION). */
export const CONSISTENCY_MIN_WEIGHT = 2;
/** Only days where the research curve is at least this big are used for the robust median (DESIGN ASSUMPTION). */
export const ROBUST_MIN_G = 0.3;

const cache = new WeakMap<object, Map<string, Calibration>>();

function clampScale(x: number): number {
  return Math.min(CALIBRATION_SCALE_MAX, Math.max(CALIBRATION_SCALE_MIN, x));
}

export function calibrateScale(
  input: MissionInput,
  metricId: MetricId,
  model: AdaptationModel,
  preflightMean: number,
  preflightSd: number,
  day: number,
): Calibration {
  let perInput = cache.get(input.readings);
  if (!perInput) {
    perInput = new Map();
    cache.set(input.readings, perInput);
  }
  const key = `${metricId}|${model.id}|${day}|${preflightMean}|${preflightSd}`;
  const hit = perInput.get(key);
  if (hit) return hit;

  const w0 = CALIBRATION_PRIOR_WEIGHT;
  const pts: { t: number; x: number; g: number }[] = [];
  const lastDay = day - CALIBRATION_EXCLUDE_RECENT_DAYS;
  if (Number.isFinite(preflightMean)) {
    for (let t = 1; t <= lastDay; t++) {
      const g = model.offset(t);
      if (g === 0) continue;
      const r = getReading(input.readings, metricId, t);
      if (!r) continue;
      pts.push({ t, x: r.value - preflightMean, g });
    }
  }
  const fit = (use: { t: number; x: number; g: number }[]) => {
    let sxg = 0;
    let sgg = 0;
    for (const p of use) {
      sxg += p.x * p.g;
      sgg += p.g * p.g;
    }
    return { scale: clampScale((sxg + w0) / (sgg + w0)), sgg };
  };

  // Pass 1 (robust): median of x/g over days where the research curve is clearly non-zero, so a
  // long episode cannot inflate the estimate it is trimmed against. Falls back to least squares.
  const ratios = pts.filter((p) => p.g >= ROBUST_MIN_G).map((p) => p.x / p.g).sort((a, b) => a - b);
  const firstScale =
    ratios.length >= 5 ? clampScale(ratios[Math.floor(ratios.length / 2)]!) : fit(pts).scale;
  // Pass 2: drop points far ABOVE the pass-1 expectation (one-sided trim), then shrinkage fit.
  const combinedSd = Math.sqrt(preflightSd * preflightSd + model.uncertainty * model.uncertainty);
  const kept = pts.filter((p) => p.x - firstScale * p.g < CALIBRATION_TRIM_Z * combinedSd);
  const second = fit(kept);

  // Consistency check on the trimmed points: early window vs recent window, no prior.
  const split = lastDay - CALIBRATION_RISE_LOOKBACK_DAYS;
  const ls = (use: { x: number; g: number }[]) => {
    let sxg = 0;
    let sgg = 0;
    for (const p of use) {
      sxg += p.x * p.g;
      sgg += p.g * p.g;
    }
    return { k: sgg > 0 ? sxg / sgg : 0, sgg };
  };
  // Earlier data is split into fixed, non-overlapping blocks of the same length (counting back from
  // the recent window). The LOWEST block estimate is the reference, so a slow change cannot hide by
  // gradually contaminating one ever-growing "early" window.
  const recent = ls(kept.filter((p) => p.t > split));
  let early: number | null = null;
  for (let end = split; end >= 1; end -= CALIBRATION_RISE_LOOKBACK_DAYS) {
    const start = end - CALIBRATION_RISE_LOOKBACK_DAYS + 1;
    const block = ls(kept.filter((p) => p.t >= start && p.t <= end));
    if (block.sgg >= CONSISTENCY_MIN_WEIGHT && (early === null || block.k < early)) early = block.k;
  }
  if (early === null) {
    const all = ls(kept.filter((p) => p.t <= split));
    if (all.sgg >= CONSISTENCY_MIN_WEIGHT) early = all.k;
  }
  const consistency =
    early !== null && recent.sgg >= CONSISTENCY_MIN_WEIGHT ? { early, recent: recent.k } : null;

  const result: Calibration = {
    scale: second.scale,
    daysUsed: kept.length,
    dataWeight: second.sgg,
    trimmedDays: pts.length - kept.length,
    established: second.sgg >= w0,
    consistency,
  };
  perInput.set(key, result);
  return result;
}

/**
 * Model uncertainty actually used for a day: the research model's individual-variation allowance,
 * shrinking as her own calibration evidence grows (can only make BASELINE more sensitive).
 * Used by BOTH the assessment and the chart band so they always agree.
 */
export function effectiveUncertainty(model: AdaptationModel, cal: Calibration): number {
  return model.uncertainty * Math.sqrt(CALIBRATION_PRIOR_WEIGHT / (CALIBRATION_PRIOR_WEIGHT + cal.dataWeight));
}
