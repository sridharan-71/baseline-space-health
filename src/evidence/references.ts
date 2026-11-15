import type { MetricId } from '../domain/types';

export interface EarthReference {
  metricId: MetricId;
  value: number;
  direction: 'above' | 'below';
  inclusive: boolean;
  label: string;
  sourceId: string;
  caveat: string;
}

export const EARTH_REFERENCES: EarthReference[] = [
  {
    metricId: 'coreTemp',
    value: 38.0,
    direction: 'above',
    inclusive: true,
    label: 'General Earth reference (38.0 °C)',
    sourceId: 'cdcFever',
    caveat: 'Measured at a different body site with a different device. Context only.',
  },
  {
    metricId: 'restingHR',
    value: 100,
    direction: 'above',
    inclusive: false,
    label: 'General Earth reference (100 bpm)',
    sourceId: 'ahaHeartRate',
    caveat: 'Population range. Context only.',
  },
];

export function getEarthReference(metricId: MetricId): EarthReference | null {
  return EARTH_REFERENCES.find((r) => r.metricId === metricId) ?? null;
}

export function crossesEarthReference(ref: EarthReference, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (ref.direction === 'above') return ref.inclusive ? value >= ref.value : value > ref.value;
  return ref.inclusive ? value <= ref.value : value < ref.value;
}
