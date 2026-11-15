import { METRICS, formatValue, type MetricAssessment } from '../../engine/index';
import { StatusBadge } from './StatusBadge';

const FIELDS = [
  ['measuredInSpace', 'Can it be measured in space?'],
  ['whyItMatters', 'Why it matters'],
  ['howSpaceAffects', 'How space affects it'],
  ['whenToContactCmo', 'When to contact your CMO'],
  ['prevention', 'Prevention / good habits'],
] as const;

export function ExplainerCard({ assessment }: { assessment: MetricAssessment }) {
  const def = METRICS[assessment.metricId];
  return (
    <article className="explainer">
      <header className="metric-card__head">
        <h3>{def.label}</h3>
        <StatusBadge status={assessment.status} />
      </header>
      <p className="metric-card__value">
        {assessment.value === null ? <span className="muted">No reading</span> : formatValue(assessment.metricId, assessment.value)}
      </p>
      <dl>
        {FIELDS.map(([key, heading]) => (
          <div key={key}>
            <dt>{heading}</dt>
            <dd>{def.explainer[key]}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
