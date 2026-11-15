// Evaluator for HYPOTHETICAL adversarial scenarios (audit tool, not clinical performance).
// Every method receives exactly the same simulated readings.
import {
  ADVERSARIAL_SCENARIOS,
  ADV_LAST_DAY,
  abnormalOffset,
  adversarialMission,
  sensorOffset,
  type AdversarialScenario,
} from '../data/simulated/adversarial';
import { getEarthReference, crossesEarthReference } from '../evidence/references';
import { assessMetricDays } from './assess';
import { computePreflightBaseline } from './baseline';
import { WATCH_Z } from './config';
import { getReading } from './readings';
import { rollingFlags } from './stressTest';

/** Evaluation choice (not clinical): a day counts as a "problem day" once the simulated change is ≥ this size. */
export const PROBLEM_MIN_C = 0.3;
/** Late-phase window used to detect absorption: the last N problem days with data. */
export const LATE_WINDOW = 10;

export type MethodId = 'earth' | 'preflight' | 'rolling' | 'baseline' | 'baselinePersonal';
/** baselinePersonal = BASELINE flags that do NOT come from the Earth line or the cool-down rule
 *  (personal deviation, "can't tell" safeguard, or ACT). Shows how much BASELINE leans on the Earth line. */
export const METHOD_IDS: MethodId[] = ['earth', 'preflight', 'rolling', 'baseline', 'baselinePersonal'];

export interface RunMetrics {
  falseAlertDays: number;
  falseAlertRuns: number;
  problemDaysWithData: number;
  caught: number;
  missed: number;
  /** Days from change onset to first flag on/after onset (null = never flagged). */
  detectionDelay: number | null;
  lateCaught: number;
  lateTotal: number;
  outlierDaysFlagged: number;
}

export interface BaselineExtras {
  actOnNormalDays: number;
  actOnProblemDays: number;
  uncertainDays: number;
  lowConfidenceDays: number;
  finalScale: number | null;
  inFlightDaysWithData: number;
}

export interface RunResult {
  methods: Record<MethodId, RunMetrics>;
  baseline: BaselineExtras;
}

function runs(days: number[]): number {
  let n = 0;
  let prev = -999;
  for (const d of [...days].sort((a, b) => a - b)) {
    if (d !== prev + 1) n++;
    prev = d;
  }
  return n;
}

export function evaluateRun(sc: AdversarialScenario, seed: number): RunResult {
  const { input, outlierDays } = adversarialMission(sc, seed);
  const days: number[] = [];
  for (let d = 1; d <= ADV_LAST_DAY; d++) if (getReading(input.readings, 'coreTemp', d)) days.push(d);

  const change = (d: number) => abnormalOffset(sc.abnormal, d) + sensorOffset(sc.data, d);
  const onsetCandidates = [
    ...sc.abnormal.map((a) => a.start),
    ...(sc.data?.sensorStepAt !== undefined ? [sc.data.sensorStepAt] : []),
    ...(sc.data?.sensorDriftFrom !== undefined ? [sc.data.sensorDriftFrom] : []),
  ];
  const onset = onsetCandidates.length ? Math.min(...onsetCandidates) : null;
  const normalDays = days.filter((d) => change(d) === 0 && !outlierDays.has(d));
  const problemDays = days.filter((d) => change(d) >= PROBLEM_MIN_C && !outlierDays.has(d));
  const lateDays = problemDays.slice(-LATE_WINDOW);

  const base = computePreflightBaseline(input.readings, 'coreTemp');
  const ref = getEarthReference('coreTemp')!;
  const assessments = assessMetricDays(input, 'coreTemp', days);
  const byDay = new Map(days.map((d, i) => [d, assessments[i]!]));
  const roll = rollingFlags(input, ADV_LAST_DAY);

  const flagged: Record<MethodId, (d: number) => boolean> = {
    earth: (d) => crossesEarthReference(ref, getReading(input.readings, 'coreTemp', d)!.value),
    preflight: (d) => (getReading(input.readings, 'coreTemp', d)!.value - base.mean) / base.sd >= WATCH_Z,
    rolling: (d) => roll.has(d),
    baseline: (d) => {
      const s = byDay.get(d)!.status;
      return s === 'WATCH' || s === 'ACT';
    },
    baselinePersonal: (d) => {
      const a = byDay.get(d)!;
      return a.status === 'ACT' || a.adaptationUncertain === true || (a.zExpected !== null && a.zExpected >= WATCH_Z);
    },
  };

  const methods = {} as Record<MethodId, RunMetrics>;
  for (const m of METHOD_IDS) {
    const f = flagged[m];
    const fa = normalDays.filter(f);
    const caught = problemDays.filter(f).length;
    let delay: number | null = null;
    if (onset !== null) {
      const first = days.find((d) => d >= onset && change(d) > 0 && f(d) && !outlierDays.has(d));
      delay = first === undefined ? null : first - onset;
    }
    methods[m] = {
      falseAlertDays: fa.length,
      falseAlertRuns: runs(fa),
      problemDaysWithData: problemDays.length,
      caught,
      missed: problemDays.length - caught,
      detectionDelay: delay,
      lateCaught: lateDays.filter(f).length,
      lateTotal: lateDays.length,
      outlierDaysFlagged: [...outlierDays].filter((d) => days.includes(d) && f(d)).length,
    };
  }

  const last = assessments[assessments.length - 1];
  return {
    methods,
    baseline: {
      actOnNormalDays: normalDays.filter((d) => byDay.get(d)!.status === 'ACT').length,
      actOnProblemDays: problemDays.filter((d) => byDay.get(d)!.status === 'ACT').length,
      uncertainDays: assessments.filter((a) => a.adaptationUncertain === true).length,
      lowConfidenceDays: assessments.filter((a) => a.confidence === 'LOW').length,
      finalScale: last?.expected?.scale ?? null,
      inFlightDaysWithData: days.length,
    },
  };
}

export interface Summary {
  mean: number;
  min: number;
  max: number;
}
const summarise = (xs: number[]): Summary =>
  xs.length === 0
    ? { mean: NaN, min: NaN, max: NaN }
    : { mean: xs.reduce((a, b) => a + b, 0) / xs.length, min: Math.min(...xs), max: Math.max(...xs) };

export interface ScenarioSummary {
  scenario: AdversarialScenario;
  seeds: number;
  methods: Record<MethodId, {
    falseAlertDays: Summary;
    caughtFraction: Summary;
    lateCaughtFraction: Summary;
    detectionDelay: Summary;
    neverDetected: number;
    outlierDaysFlagged: Summary;
    problemDaysWithData: Summary;
  }>;
  baseline: {
    actOnNormalDays: Summary;
    actOnProblemDays: Summary;
    uncertainDays: Summary;
    lowConfidenceDays: Summary;
    finalScale: Summary;
    inFlightDaysWithData: Summary;
  };
}

export function evaluateScenario(sc: AdversarialScenario, seeds: number[]): ScenarioSummary {
  const results = seeds.map((s) => evaluateRun(sc, s));
  const methods = {} as ScenarioSummary['methods'];
  for (const m of METHOD_IDS) {
    const r = results.map((x) => x.methods[m]);
    const hasProblem = r.some((x) => x.problemDaysWithData > 0);
    methods[m] = {
      falseAlertDays: summarise(r.map((x) => x.falseAlertDays)),
      caughtFraction: summarise(hasProblem ? r.map((x) => (x.problemDaysWithData ? x.caught / x.problemDaysWithData : 0)) : []),
      lateCaughtFraction: summarise(hasProblem ? r.map((x) => (x.lateTotal ? x.lateCaught / x.lateTotal : 0)) : []),
      detectionDelay: summarise(r.map((x) => x.detectionDelay).filter((x): x is number => x !== null)),
      neverDetected: hasProblem ? r.filter((x) => x.detectionDelay === null).length : 0,
      outlierDaysFlagged: summarise(r.map((x) => x.outlierDaysFlagged)),
      problemDaysWithData: summarise(r.map((x) => x.problemDaysWithData)),
    };
  }
  const b = results.map((x) => x.baseline);
  return {
    scenario: sc,
    seeds: seeds.length,
    methods,
    baseline: {
      actOnNormalDays: summarise(b.map((x) => x.actOnNormalDays)),
      actOnProblemDays: summarise(b.map((x) => x.actOnProblemDays)),
      uncertainDays: summarise(b.map((x) => x.uncertainDays)),
      lowConfidenceDays: summarise(b.map((x) => x.lowConfidenceDays)),
      finalScale: summarise(b.map((x) => x.finalScale ?? NaN).filter(Number.isFinite)),
      inFlightDaysWithData: summarise(b.map((x) => x.inFlightDaysWithData)),
    },
  };
}

export const AUDIT_SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

export function evaluateAll(seeds = AUDIT_SEEDS): ScenarioSummary[] {
  return ADVERSARIAL_SCENARIOS.map((sc) => evaluateScenario(sc, seeds));
}
