import type { Direction, MetricId, SymptomId } from './types';

export interface MetricExplainer {
  measuredInSpace: string;
  whyItMatters: string;
  howSpaceAffects: string;
  whenToContactCmo: string;
  prevention: string;
}

export interface MetricDefinition {
  id: MetricId;
  label: string;
  unit: string;
  decimals: number;
  plausibleMin: number;
  plausibleMax: number;
  sdFloor: number;
  unhealthyDirection: Direction;
  bodySystem: 'whole-body' | 'heart' | 'brain';
  isSelfReport: boolean;
  explainer: MetricExplainer;
}

const CONTACT_CMO =
  "When BASELINE shows ACT, or whenever you feel unwell — you never need the app's permission to contact your CMO.";

export const METRICS: Record<MetricId, MetricDefinition> = {
  coreTemp: {
    id: 'coreTemp',
    label: 'Core temperature estimate',
    unit: '°C',
    decimals: 2,
    plausibleMin: 34.0,
    plausibleMax: 42.0,
    sdFloor: 0.1,
    unhealthyDirection: 'up',
    bodySystem: 'whole-body',
    isSelfReport: false,
    explainer: {
      measuredInSpace:
        'Yes. In BASELINE this is a SIMULATED estimate from a heat-flux forehead sensor (the type used by Stahn et al. 2017), not an oral thermometer.',
      whyItMatters:
        'Core temperature reflects how well your body is balancing heat. A change from your own normal is worth noticing.',
      howSpaceAffects:
        'Without gravity, warm air does not rise away from the body, so heat is lost more slowly. ISS crews showed a gradual rise of about 1 °C over the first months.',
      whenToContactCmo: CONTACT_CMO,
      prevention:
        'Wear the sensor as scheduled, keep exercise sessions cool and ventilated, and drink water regularly.',
    },
  },
  restingHR: {
    id: 'restingHR',
    label: 'Resting heart rate',
    unit: 'bpm',
    decimals: 0,
    plausibleMin: 30,
    plausibleMax: 200,
    sdFloor: 2,
    unhealthyDirection: 'up',
    bodySystem: 'heart',
    isSelfReport: false,
    explainer: {
      measuredInSpace:
        'Yes. Wearable sensors and chest straps measure heart rate on the ISS. BASELINE uses simulated readings taken at rest.',
      whyItMatters:
        'A resting heart rate that rises above your own normal for several days can be a sign that your body is under extra strain.',
      howSpaceAffects:
        'Fluids shift toward the head in weightlessness and the heart adjusts. There is no single expected change for everyone, so BASELINE compares with your pre-flight normal.',
      whenToContactCmo: CONTACT_CMO,
      prevention:
        'Measure at the same time each day, before exercise or caffeine, and keep up your scheduled exercise.',
    },
  },
  sleepHours: {
    id: 'sleepHours',
    label: 'Sleep',
    unit: 'h',
    decimals: 1,
    plausibleMin: 0,
    plausibleMax: 16,
    sdFloor: 0.3,
    unhealthyDirection: 'down',
    bodySystem: 'brain',
    isSelfReport: false,
    explainer: {
      measuredInSpace:
        'Yes. Wrist actigraphy and sleep logs are used on the ISS. BASELINE uses simulated nightly totals.',
      whyItMatters:
        'Short sleep affects attention, mood and reaction time — all important for safe work in space.',
      howSpaceAffects:
        'Noise, light, schedule shifts and a 90-minute day–night cycle make sleep harder. ISS crews averaged about 6 hours a night.',
      whenToContactCmo: CONTACT_CMO,
      prevention:
        'Keep a regular sleep window, dim lights before rest, and use eye masks and earplugs in your crew quarters.',
    },
  },
  mood: {
    id: 'mood',
    label: 'Mood (self-rated 1–5)',
    unit: '/5',
    decimals: 0,
    plausibleMin: 1,
    plausibleMax: 5,
    sdFloor: 0.5,
    unhealthyDirection: 'down',
    bodySystem: 'brain',
    isSelfReport: true,
    explainer: {
      measuredInSpace:
        'Yes, by asking. You rate your mood from 1 (very low) to 5 (very good) at each check-in.',
      whyItMatters:
        'How you feel is real data. A drop from your usual rating, especially for several days, is worth sharing.',
      howSpaceAffects:
        'Isolation, confinement, workload and short sleep can all lower mood over a long mission.',
      whenToContactCmo: CONTACT_CMO,
      prevention:
        'Keep in touch with family and crewmates, protect personal time, and rate honestly — there is no right answer.',
    },
  },
};

export const METRIC_ORDER: MetricId[] = ['coreTemp', 'restingHR', 'sleepHours', 'mood'];

export const SYMPTOM_LABELS: Record<SymptomId, string> = {
  fatigue: 'fatigue',
  headache: 'headache',
  feeling_hot: 'feeling hot',
  chills: 'chills',
  nausea: 'nausea',
  congestion: 'congestion',
  poor_sleep: 'poor sleep',
  other: 'other',
};

export function isMetricId(x: unknown): x is MetricId {
  return typeof x === 'string' && Object.prototype.hasOwnProperty.call(METRICS, x);
}

export function isSymptomId(x: unknown): x is SymptomId {
  return typeof x === 'string' && Object.prototype.hasOwnProperty.call(SYMPTOM_LABELS, x);
}

/** "38.35 °C", "70 bpm", "3/5". */
export function formatValue(metricId: MetricId, value: number, decimals = METRICS[metricId].decimals): string {
  const unit = METRICS[metricId].unit;
  return `${value.toFixed(decimals)}${unit.startsWith('/') ? '' : ' '}${unit}`;
}
