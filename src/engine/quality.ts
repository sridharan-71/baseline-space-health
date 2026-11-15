import { METRICS } from '../domain/metrics';
import type { MetricId, PreflightBaseline, Reading } from '../domain/types';
import { MIN_BASELINE_DAYS } from './config';

export function checkDataQuality(args: {
  baseline: PreflightBaseline;
  reading: Reading | null;
  metricId: MetricId;
}): { ok: boolean; reasons: string[] } {
  const { baseline, reading, metricId } = args;
  const reasons: string[] = [];
  if (baseline.n < MIN_BASELINE_DAYS) {
    reasons.push(
      `Only ${baseline.n} pre-flight readings (need ${MIN_BASELINE_DAYS}) — personal normal not established.`,
    );
  }
  if (!reading) {
    reasons.push('No reading for this day.');
  } else {
    const m = METRICS[metricId];
    if (!Number.isFinite(reading.value) || reading.value < m.plausibleMin || reading.value > m.plausibleMax) {
      reasons.push('Reading outside plausible range.');
    }
  }
  return { ok: reasons.length === 0, reasons };
}
