import type { MetricId } from '../domain/types';

export interface AdaptationModel {
  id: string;
  metricId: MetricId;
  sourceIds: string[];
  evidenceStrength: 'MODERATE' | 'LOW';
  summary: string;
  designAssumptions: string[];
  offset(day: number): number;
  uncertainty: number;
}

export const ADAPTATION_MODELS: AdaptationModel[] = [
  {
    id: 'coreTemp-stahn2017',
    metricId: 'coreTemp',
    sourceIds: ['stahn2017', 'prototypeRules'],
    evidenceStrength: 'MODERATE',
    summary: 'Expected rise of about +1.0 °C reached by flight day 75, then flat (group mean of 11 ISS crew).',
    designAssumptions: [
      'Linear ramp from FD0 to FD75 between the measured time points',
      'Extra ±0.15 °C uncertainty for individual differences',
      'Applies only to heat-flux core-temperature estimates',
    ],
    offset: (d) => (d <= 0 ? 0 : 1.0 * Math.min(d / 75, 1)),
    uncertainty: 0.15,
  },
];

export function getAdaptationModel(metricId: MetricId): AdaptationModel | null {
  return ADAPTATION_MODELS.find((m) => m.metricId === metricId) ?? null;
}

export function expectedOffset(
  metricId: MetricId,
  day: number,
): { offset: number; uncertainty: number; modelId: string } | null {
  const model = getAdaptationModel(metricId);
  if (!model || day <= 0) return null;
  return { offset: model.offset(day), uncertainty: model.uncertainty, modelId: model.id };
}
