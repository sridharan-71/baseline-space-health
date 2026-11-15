import { METRICS, METRIC_ORDER, formatValue } from '../domain/metrics';
import { formatDay, phaseOf } from '../domain/phase';
import type {
  Confidence,
  DayAssessment,
  ExpectedValue,
  LayerResult,
  MetricAssessment,
  MetricId,
  MissionInput,
  SelfReport,
  Status,
} from '../domain/types';
import { getAdaptationModel, type AdaptationModel } from '../evidence/adaptation';
import { crossesEarthReference, getEarthReference, type EarthReference } from '../evidence/references';
import { EVIDENCE } from '../evidence/sources';
import { computePreflightBaseline } from './baseline';
import {
  ACT_Z,
  CONFIDENT_BASELINE_DAYS,
  EARTH_CROSSINGS_FOR_ACT,
  MAX_LOOKBACK_DAYS,
  PERSIST_REQUIRED,
  WATCH_Z,
} from './config';
import { checkDataQuality } from './quality';
import { availableDays, getReading } from './readings';
import { persistenceCount, unhealthyZ, windowDays } from './trend';
import type { MetricDefinition } from '../domain/metrics';
import type { PreflightBaseline } from '../domain/types';

const NEXT_STEP: Record<Status, string> = {
  UNKNOWN: 'Take or re-take this reading.',
  OK: 'No action needed.',
  WATCH: 'Re-check within 24 h. Note how you feel.',
  ACT: 'Contact your crew medical officer. BASELINE has drafted a note.',
};

const NO_MODEL_TEXT =
  'No research-based adaptation model for this measure; compared with your pre-flight normal.';

interface Ctx {
  input: MissionInput;
  metricId: MetricId;
  def: MetricDefinition;
  baseline: PreflightBaseline;
  model: AdaptationModel | null;
  ref: EarthReference | null;
}

interface DayCore {
  value: number;
  zPreflight: number;
  zExpected: number;
  expected: ExpectedValue | null;
  /** SD used for zExpected (combined SD with a model, pre-flight SD without). */
  spread: number;
  earthCrossed: boolean;
}

interface WindowCore {
  days: number[];
  missing: number;
  persistence: number;
  earthCrossings: number;
  zByDay: Map<number, number>;
}

function makeCtx(input: MissionInput, metricId: MetricId): Ctx {
  return {
    input,
    metricId,
    def: METRICS[metricId],
    baseline: computePreflightBaseline(input.readings, metricId),
    model: getAdaptationModel(metricId),
    ref: getEarthReference(metricId),
  };
}

/** z-scores for one day with a reading. Pure arithmetic; no status logic. */
function dayCore(ctx: Ctx, day: number): DayCore | null {
  const r = getReading(ctx.input.readings, ctx.metricId, day);
  if (!r) return null;
  const { mean, sd } = ctx.baseline;
  const zPreflight = (r.value - mean) / sd;
  let zExpected = zPreflight;
  let expected: ExpectedValue | null = null;
  let spread = sd;
  if (ctx.model && day > 0) {
    const offset = ctx.model.offset(day);
    const combinedSd = Math.sqrt(sd * sd + ctx.model.uncertainty ** 2);
    expected = { offset, value: mean + offset, uncertainty: ctx.model.uncertainty, modelId: ctx.model.id };
    zExpected = (r.value - expected.value) / combinedSd;
    spread = combinedSd;
  }
  const earthCrossed = ctx.ref ? crossesEarthReference(ctx.ref, r.value) : false;
  return { value: r.value, zPreflight, zExpected, expected, spread, earthCrossed };
}

function windowCore(ctx: Ctx, day: number): WindowCore {
  const avail = availableDays(ctx.input.readings, ctx.metricId, day - MAX_LOOKBACK_DAYS + 1, day);
  const { days, missing } = windowDays(avail, day);
  const zByDay = new Map<number, number>();
  let earthCrossings = 0;
  for (const d of days) {
    const c = dayCore(ctx, d);
    if (!c) continue;
    zByDay.set(d, c.zExpected);
    if (c.earthCrossed) earthCrossings++;
  }
  const persistence = persistenceCount(zByDay, days, ctx.def.unhealthyDirection);
  return { days, missing, persistence, earthCrossings, zByDay };
}

/** The ACT rule without the cool-down (used for one level of lookback). */
function meetsAct(ctx: Ctx, core: DayCore, win: WindowCore): boolean {
  const uz = unhealthyZ(core.zExpected, ctx.def.unhealthyDirection);
  return (uz >= ACT_Z && win.persistence >= PERSIST_REQUIRED) || win.earthCrossings >= EARTH_CROSSINGS_FOR_ACT;
}

function wasActOn(ctx: Ctx, day: number): boolean {
  const core = dayCore(ctx, day);
  if (!core) return false;
  return meetsAct(ctx, core, windowCore(ctx, day));
}

const fmt = (x: number, decimals: number) => x.toFixed(decimals);
const signed = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(1)}`;

function stepDown(c: Confidence): Confidence {
  return c === 'HIGH' ? 'MEDIUM' : 'LOW';
}

function unknownResult(ctx: Ctx, day: number, reasons: string[], value: number | null): MetricAssessment {
  const na = (layer: LayerResult['layer']): LayerResult => ({
    layer,
    outcome: 'NOT_APPLICABLE',
    detail: 'Not assessed — data quality check failed.',
    evidenceIds: [],
  });
  return {
    metricId: ctx.metricId,
    missionDay: day,
    status: 'UNKNOWN',
    confidence: 'LOW',
    value,
    preflight: ctx.baseline,
    expected: null,
    zPreflight: null,
    zExpected: null,
    persistence: { flaggedOfLastAvailable: 0, availableInWindow: 0, missingInWindow: 0 },
    earthCrossed: false,
    layers: [
      { layer: 'DATA_QUALITY', outcome: 'FAIL', detail: reasons.join(' '), evidenceIds: ['prototypeRules'] },
      na('PERSONAL_DEVIATION'),
      na('EXPECTED_ADAPTATION'),
      na('PERSISTENCE'),
      na('EARTH_REFERENCE'),
    ],
    headline: `${ctx.def.label}: not enough data — ${reasons[0] ?? 'Could not assess this reading.'}`,
    nextStep: NEXT_STEP.UNKNOWN,
    reasons,
    confidenceReasons: ['Status is UNKNOWN, so confidence is Low.'],
  };
}

function assessWithCtx(ctx: Ctx, day: number): MetricAssessment {
  const { def, baseline, model, ref } = ctx;
  const reading = getReading(ctx.input.readings, ctx.metricId, day);

  // L1 DATA_QUALITY
  const quality = checkDataQuality({ baseline, reading, metricId: ctx.metricId });
  if (!quality.ok || !reading) return unknownResult(ctx, day, quality.reasons, reading?.value ?? null);

  const core = dayCore(ctx, day)!;
  const dir = def.unhealthyDirection;
  const d = def.decimals;

  // L2 PERSONAL_DEVIATION
  const preFlag = unhealthyZ(core.zPreflight, dir) >= WATCH_Z;
  const l2: LayerResult = {
    layer: 'PERSONAL_DEVIATION',
    outcome: preFlag ? 'FLAG' : 'PASS',
    detail: `${signed(core.zPreflight)} SD ${core.zPreflight >= 0 ? 'above' : 'below'} your pre-flight normal (${fmt(baseline.mean, Math.max(d, 1))} ± ${formatValue(ctx.metricId, baseline.sd, Math.max(d, 1))}, n = ${baseline.n}).`,
    evidenceIds: ['prototypeRules'],
  };

  // L3 EXPECTED_ADAPTATION
  const expFlag = unhealthyZ(core.zExpected, dir) >= WATCH_Z;
  let l3: LayerResult;
  if (phaseOf(day) !== 'INFLIGHT') {
    l3 = { layer: 'EXPECTED_ADAPTATION', outcome: 'NOT_APPLICABLE', detail: 'Pre-flight day.', evidenceIds: [] };
  } else if (model && core.expected) {
    const cites = model.sourceIds
      .map((id) => EVIDENCE[id])
      .filter((s) => s && s.kind === 'RESEARCH')
      .map((s) => s!.shortCite)
      .join(', ');
    l3 = {
      layer: 'EXPECTED_ADAPTATION',
      outcome: expFlag ? 'FLAG' : 'PASS',
      detail: `Expected in-flight normal for ${formatDay(day)}: ${fmt(core.expected.value, d)} ± ${formatValue(ctx.metricId, WATCH_Z * core.spread)} (${cites}; group-mean curve; design assumptions apply). Today is ${signed(core.zExpected)} SD from expected.`,
      evidenceIds: [...model.sourceIds],
    };
  } else {
    l3 = { layer: 'EXPECTED_ADAPTATION', outcome: 'NOT_APPLICABLE', detail: NO_MODEL_TEXT, evidenceIds: ['prototypeRules'] };
  }

  // L4 PERSISTENCE
  const win = windowCore(ctx, day);
  const n = win.days.length;
  const k = win.persistence;
  const l4: LayerResult = {
    layer: 'PERSISTENCE',
    outcome: k >= PERSIST_REQUIRED ? 'FLAG' : 'PASS',
    detail:
      `${k} of the last ${n} available day${n === 1 ? '' : 's'} outside your expected range.` +
      (win.missing > 0 ? ` ${win.missing} day${win.missing === 1 ? '' : 's'} with no reading inside this window.` : ''),
    evidenceIds: ['prototypeRules'],
  };

  // L5 EARTH_REFERENCE
  let l5: LayerResult;
  if (!ref) {
    l5 = {
      layer: 'EARTH_REFERENCE',
      outcome: 'NOT_APPLICABLE',
      detail: 'No general Earth reference is used for this measure.',
      evidenceIds: [],
    };
  } else {
    l5 = {
      layer: 'EARTH_REFERENCE',
      outcome: core.earthCrossed ? 'FLAG' : 'PASS',
      detail: `${core.earthCrossed ? 'Past' : 'Within'} the ${ref.label.charAt(0).toLowerCase()}${ref.label.slice(1)} today; past it on ${win.earthCrossings} of the last ${n} available days. ${ref.caveat}`,
      evidenceIds: [ref.sourceId],
    };
  }

  // Status
  const uz = unhealthyZ(core.zExpected, dir);
  const actByZ = uz >= ACT_Z && k >= PERSIST_REQUIRED;
  const actByEarth = win.earthCrossings >= EARTH_CROSSINGS_FOR_ACT;
  let status: Status;
  let coolDown = false;
  if (actByZ || actByEarth) {
    status = 'ACT';
  } else if (uz >= WATCH_Z || core.earthCrossed) {
    status = 'WATCH';
  } else if (win.days.some((wd) => wd !== day && wasActOn(ctx, wd))) {
    status = 'WATCH';
    coolDown = true;
  } else {
    status = 'OK';
  }

  // Confidence
  let confidence: Confidence = 'HIGH';
  const confidenceReasons: string[] = [];
  if (baseline.n < CONFIDENT_BASELINE_DAYS) {
    confidence = stepDown(confidence);
    confidenceReasons.push(`Only ${baseline.n} pre-flight readings (${CONFIDENT_BASELINE_DAYS} or more gives full confidence).`);
  }
  if (model && model.evidenceStrength === 'LOW' && phaseOf(day) === 'INFLIGHT') {
    confidence = stepDown(confidence);
    confidenceReasons.push('The adaptation model for this measure has low evidence strength.');
  }
  if (win.missing > 0) {
    confidence = stepDown(confidence);
    confidenceReasons.push('A day with no reading falls inside the recent window.');
  }

  // Headline
  let headline: string;
  if (status === 'OK') {
    headline =
      model && core.expected && preFlag
        ? `${def.label}: above your pre-flight normal, but within the expected in-flight range for ${formatDay(day)}.`
        : `${def.label}: within your expected range.`;
  } else if (status === 'WATCH' && !coolDown && uz < WATCH_Z) {
    headline = `${def.label}: within your expected range, but past the general Earth reference today.`;
  } else if (status === 'WATCH' && !coolDown) {
    const expectedValue = core.expected ? core.expected.value : baseline.mean;
    headline = `${def.label}: outside your expected range today (${fmt(core.value, d)} vs expected ${fmt(expectedValue, Math.max(d, 1))} ± ${formatValue(ctx.metricId, WATCH_Z * core.spread, Math.max(d, 1))}).`;
  } else if (status === 'WATCH') {
    headline = `${def.label}: back inside your expected range, but recently ACT — keep checking.`;
  } else if (actByZ) {
    headline = `${def.label}: outside your expected range on ${k} of the last ${n} available days.`;
  } else {
    headline = `${def.label}: past the general Earth reference on ${win.earthCrossings} of the last ${n} available days.`;
  }
  const headlineMentionsEarth = (status === 'ACT' && !actByZ) || (status === 'WATCH' && !coolDown && uz < WATCH_Z);
  if (core.earthCrossed && !headlineMentionsEarth) headline += ' Also past the general Earth reference.';

  // Reasons that drove the status
  const reasons: string[] = [];
  if (status === 'OK') {
    reasons.push(l3.outcome === 'NOT_APPLICABLE' ? l2.detail : l3.detail);
  } else {
    if (l3.outcome === 'FLAG' || (l3.outcome === 'NOT_APPLICABLE' && l2.outcome === 'FLAG')) {
      reasons.push(l3.outcome === 'FLAG' ? l3.detail : l2.detail);
    }
    if (l4.outcome === 'FLAG') reasons.push(l4.detail);
    if (l5.outcome === 'FLAG' || actByEarth) reasons.push(l5.detail);
    if (coolDown) reasons.push('Recently ACT — keep checking.');
  }

  return {
    metricId: ctx.metricId,
    missionDay: day,
    status,
    confidence,
    value: core.value,
    preflight: baseline,
    expected: core.expected,
    zPreflight: core.zPreflight,
    zExpected: core.zExpected,
    persistence: { flaggedOfLastAvailable: k, availableInWindow: n, missingInWindow: win.missing },
    earthCrossed: core.earthCrossed,
    layers: [
      { layer: 'DATA_QUALITY', outcome: 'PASS', detail: `Valid reading; personal normal from ${baseline.n} pre-flight days.`, evidenceIds: ['prototypeRules'] },
      l2,
      l3,
      l4,
      l5,
    ],
    headline,
    nextStep: NEXT_STEP[status],
    reasons,
    confidenceReasons,
  };
}

export function assessMetric(input: MissionInput, metricId: MetricId, day: number): MetricAssessment {
  let ctx: Ctx | null = null;
  try {
    ctx = makeCtx(input, metricId);
    return assessWithCtx(ctx, day);
  } catch {
    const def = METRICS[metricId];
    const fallbackCtx: Ctx = ctx ?? {
      input,
      metricId,
      def: def ?? METRICS.coreTemp,
      baseline: { mean: NaN, sd: def?.sdFloor ?? 1, n: 0 },
      model: null,
      ref: null,
    };
    return unknownResult(fallbackCtx, day, ['Could not assess this reading.'], null);
  }
}

/** Internal: assess many days of one metric reusing the same baseline. */
export function assessMetricDays(input: MissionInput, metricId: MetricId, days: number[]): MetricAssessment[] {
  const ctx = makeCtx(input, metricId);
  return days.map((d) => {
    try {
      return assessWithCtx(ctx, d);
    } catch {
      return unknownResult(ctx, d, ['Could not assess this reading.'], null);
    }
  });
}

const SEVERITY: Record<Status, number> = { UNKNOWN: -1, OK: 0, WATCH: 1, ACT: 2 };

function selfReportFor(reports: SelfReport[], day: number): SelfReport | null {
  let best: SelfReport | null = null;
  for (const s of reports) {
    if (s.missionDay !== day) continue;
    if (!best || !(best.source === 'USER_ENTERED' && s.source === 'SIMULATED')) best = s;
  }
  return best;
}

export function assessDay(input: MissionInput, day: number): DayAssessment {
  const metrics = METRIC_ORDER.map((id) => assessMetric(input, id, day));
  const known = metrics.filter((m) => m.status !== 'UNKNOWN');
  const unknownCount = metrics.length - known.length;
  let overall: Status = 'UNKNOWN';
  if (known.length > 0) {
    overall = known.reduce<Status>((worst, m) => (SEVERITY[m.status] > SEVERITY[worst] ? m.status : worst), 'OK');
  }
  const selfReport = selfReportFor(input.selfReports, day);
  const anyAct = metrics.some((m) => m.status === 'ACT');
  const anyWatch = metrics.some((m) => m.status === 'WATCH');
  const hasSymptoms = (selfReport?.symptoms.length ?? 0) > 0;
  return {
    missionDay: day,
    phase: phaseOf(day),
    overall,
    metrics,
    unknownCount,
    selfReport,
    cmoSuggested: anyAct || (anyWatch && hasSymptoms),
  };
}
