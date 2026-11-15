// The ONLY import surface for state/ and ui/.
export { assessMetric, assessDay } from './assess';
export { compareLenses } from './lenses';
export { buildCmoNote } from './handoff';
export { PROTOTYPE_RULES, WATCH_Z, ACT_Z } from './config';
export { EVIDENCE, EVIDENCE_KIND_LABEL } from '../evidence/sources';
export type { EvidenceSource, EvidenceKind } from '../evidence/sources';
export { ADAPTATION_MODELS } from '../evidence/adaptation';
export type { AdaptationModel } from '../evidence/adaptation';
export { EARTH_REFERENCES } from '../evidence/references';
export type { EarthReference } from '../evidence/references';
export { METRICS, METRIC_ORDER, SYMPTOM_LABELS, formatValue } from '../domain/metrics';
export type { MetricDefinition } from '../domain/metrics';
export { validateReading, validateSelfReport } from '../domain/validation';
export * from '../domain/types';
export { formatDay, phaseOf } from '../domain/phase';
