// Plain-language wording for the UI. Display text only — no rules or thresholds live here.
import { METRICS, type LayerName, type LayerOutcome, type MetricAssessment, type MetricId, type Status } from '../engine/index';

/** What each status means, in words a first-time viewer understands. */
export const STATUS_PLAIN: Record<Status, string> = {
  OK: 'Normal for you',
  WATCH: 'Keep an eye on it',
  ACT: 'Tell your medical officer',
  UNKNOWN: 'No data',
};

export const STATUS_EXPLAIN: Record<Status, string> = {
  OK: 'Matches what we expect for you on this day in space.',
  WATCH: 'Unusual today. Check again tomorrow.',
  ACT: 'Unusual for more than one day. Share it with the crew medical officer.',
  UNKNOWN: 'No usable reading, so BASELINE will not guess.',
};

/** "Day 99 in space", "12 days before launch", "Launch day". */
export function friendlyDay(day: number): string {
  if (day > 0) return `Day ${day} in space`;
  if (day === 0) return 'Launch day';
  const n = -day;
  return `${n} day${n === 1 ? '' : 's'} before launch`;
}

/** Each layer of the "Why?" card as the question it answers. */
export const LAYER_QUESTION: Record<LayerName, string> = {
  DATA_QUALITY: 'Is there a usable reading?',
  PERSONAL_DEVIATION: 'Is it different from your normal before launch?',
  EXPECTED_ADAPTATION: 'Is it still different after allowing for normal space changes?',
  PERSISTENCE: 'Has it lasted more than one day?',
  EARTH_REFERENCE: 'Is it past a general medical limit used on Earth?',
};

/** Answer wording per outcome, chosen so each reads naturally after its question. */
export function layerAnswer(layer: LayerName, outcome: LayerOutcome): string {
  if (outcome === 'NOT_APPLICABLE') return 'Not used';
  if (layer === 'DATA_QUALITY') return outcome === 'PASS' ? 'Yes' : 'No';
  return outcome === 'FLAG' ? 'Yes' : 'No';
}

/** Short names for compact cards and navigation. */
export const SHORT_LABEL: Record<MetricId, string> = {
  coreTemp: 'Core temperature',
  restingHR: 'Resting heart rate',
  sleepHours: 'Sleep',
  mood: 'Mood',
};

export interface Reference {
  value: number;
  /** What the reading is compared with, in plain words. */
  label: string;
  /** Whether the reference includes a research-based space-adaptation model. */
  kind: 'space-model' | 'personal';
}

/** The reference BASELINE actually compares today's reading with. */
export function referenceFor(a: MetricAssessment): Reference | null {
  if (a.expected) return { value: a.expected.value, label: 'Expected for you today', kind: 'space-model' };
  if (a.preflight.n > 0 && Number.isFinite(a.preflight.mean))
    return { value: a.preflight.mean, label: 'Your usual before launch', kind: 'personal' };
  return null;
}

/** "0.42 °C above", "3 bpm below", "same as" — the direction and size of today's change. */
export function changeText(a: MetricAssessment): { arrow: '↑' | '↓' | '→'; text: string } | null {
  const ref = referenceFor(a);
  if (a.value === null || !ref) return null;
  const def = METRICS[a.metricId];
  const d = a.value - ref.value;
  const step = 10 ** -def.decimals;
  if (Math.abs(d) < step / 2) return { arrow: '→', text: `Same as ${ref.label.toLowerCase()}` };
  const size = `${Math.abs(d).toFixed(def.decimals)}${def.unit.startsWith('/') ? '' : ' '}${def.unit}`;
  return { arrow: d > 0 ? '↑' : '↓', text: `${size} ${d > 0 ? 'above' : 'below'} ${ref.label.toLowerCase()}` };
}

/** Confidence in words, with the main reason. Never a made-up percentage. */
export const CONFIDENCE_WORD = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as const;
