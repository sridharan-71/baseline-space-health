import { METRICS, isMetricId, isSymptomId } from './metrics';
import type { DataSource, Reading, SelfReport } from './types';

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const SOURCES: DataSource[] = ['SIMULATED', 'USER_ENTERED'];
const MIN_DAY = -60;
const MAX_DAY = 400;
const MAX_NOTE = 500;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function checkDay(day: unknown, errors: string[]): void {
  if (typeof day !== 'number' || !Number.isInteger(day)) {
    errors.push('Mission day must be a whole number.');
  } else if (day < MIN_DAY || day > MAX_DAY) {
    errors.push(`Mission day must be between ${MIN_DAY} and ${MAX_DAY}.`);
  } else if (day === 0) {
    errors.push('No readings are recorded on launch day.');
  }
}

function checkSource(source: unknown, errors: string[]): void {
  if (!SOURCES.includes(source as DataSource)) errors.push('Unknown data source.');
}

export function validateReading(r: unknown): ValidationResult<Reading> {
  const errors: string[] = [];
  if (!isObject(r)) return { ok: false, errors: ['Reading must be an object.'] };

  const { metricId, missionDay, value, source } = r;
  if (!isMetricId(metricId)) {
    errors.push('Unknown measure.');
  } else {
    const m = METRICS[metricId];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push('Value must be a number.');
    } else if (value < m.plausibleMin || value > m.plausibleMax) {
      errors.push(`Value must be between ${m.plausibleMin} and ${m.plausibleMax} ${m.unit}.`);
    } else if (metricId === 'mood' && !Number.isInteger(value)) {
      errors.push('Mood must be a whole number from 1 to 5.');
    }
  }
  checkDay(missionDay, errors);
  checkSource(source, errors);

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { metricId: metricId as Reading['metricId'], missionDay: missionDay as number, value: value as number, source: source as DataSource },
  };
}

export function validateSelfReport(s: unknown): ValidationResult<SelfReport> {
  const errors: string[] = [];
  if (!isObject(s)) return { ok: false, errors: ['Self-report must be an object.'] };

  const { missionDay, symptoms, note, source } = s;
  checkDay(missionDay, errors);
  if (!Array.isArray(symptoms) || !symptoms.every(isSymptomId)) {
    errors.push('Unknown symptom.');
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > MAX_NOTE)) {
    errors.push(`Note must be text of at most ${MAX_NOTE} characters.`);
  }
  checkSource(source, errors);

  if (errors.length > 0) return { ok: false, errors };
  const value: SelfReport = {
    missionDay: missionDay as number,
    symptoms: [...(symptoms as SelfReport['symptoms'])],
    source: source as DataSource,
  };
  if (typeof note === 'string' && note.length > 0) value.note = note;
  return { ok: true, value };
}
