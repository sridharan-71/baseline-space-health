import { useState } from 'react';
import { METRICS, formatValue, type MetricAssessment } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { ConfidenceTag } from './ConfidenceTag';
import { StatusBadge, STATUS_COLOR } from './StatusBadge';
import { WhyCard } from './WhyCard';

export function MetricCard({
  assessment,
  showChartButton = true,
  defaultOpen = false,
}: {
  assessment: MetricAssessment;
  showChartButton?: boolean;
  defaultOpen?: boolean;
}) {
  const { jumpTo } = useMission();
  const [open, setOpen] = useState(defaultOpen);
  const def = METRICS[assessment.metricId];
  return (
    <article
      className="metric-card"
      style={{ borderTopColor: STATUS_COLOR[assessment.status] }}
      aria-label={`${def.label} card`}
      data-testid={`card-${assessment.metricId}`}
    >
      <header className="metric-card__head">
        <h3>{def.label}</h3>
        <StatusBadge status={assessment.status} />
      </header>
      <p className="metric-card__value">
        {assessment.value === null ? <span className="muted">No reading</span> : formatValue(assessment.metricId, assessment.value)}
      </p>
      <ConfidenceTag assessment={assessment} />
      <p className="metric-card__headline">{assessment.headline}</p>
      <p className="metric-card__next">
        <strong>Next step:</strong> {assessment.nextStep}
      </p>
      <div className="metric-card__actions">
        <button type="button" className="btn btn--ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide why' : 'Why?'}
        </button>
        {showChartButton && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => jumpTo(assessment.missionDay, assessment.metricId, 'measure')}
          >
            See chart
          </button>
        )}
      </div>
      {open && <WhyCard assessment={assessment} />}
    </article>
  );
}
