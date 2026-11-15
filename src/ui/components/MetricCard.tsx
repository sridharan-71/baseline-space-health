import { useState } from 'react';
import { METRICS, formatValue, type MetricAssessment } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { SHORT_LABEL, changeText, referenceFor } from '../plain';
import { ConfidenceTag } from './ConfidenceTag';
import { StatusBadge } from './StatusBadge';
import { WhyCard } from './WhyCard';

/** One measure on one day: reading, what it is compared with, the change, the status and why. */
export function MetricCard({
  assessment,
  showChartButton = true,
  defaultOpen = false,
  compact = false,
}: {
  assessment: MetricAssessment;
  showChartButton?: boolean;
  defaultOpen?: boolean;
  /** Today's overview: the headline and next step already appear under "What needs attention?". */
  compact?: boolean;
}) {
  const flaggedElsewhere = compact && (assessment.status === 'WATCH' || assessment.status === 'ACT');
  const { jumpTo } = useMission();
  const [open, setOpen] = useState(defaultOpen);
  const def = METRICS[assessment.metricId];
  const id = assessment.metricId;
  const ref = referenceFor(assessment);
  const change = changeText(assessment);
  const status = assessment.status.toLowerCase();
  const valueParts = assessment.value === null ? null : formatValue(id, assessment.value);

  return (
    <article className={`metric-card metric-card--${status}`} aria-label={`${def.label} card`} data-testid={`card-${id}`}>
      <header className="metric-card__head">
        <h3>{SHORT_LABEL[id]}</h3>
        <StatusBadge status={assessment.status} />
      </header>

      <div className="metric-card__reading">
        {valueParts === null ? (
          <p className="metric-card__value metric-card__value--none">No reading</p>
        ) : (
          <p className="metric-card__value">{valueParts}</p>
        )}
        {change && (
          <p className={`metric-card__change metric-card__change--${status}`}>
            <span aria-hidden="true">{change.arrow}</span> {change.text}
          </p>
        )}
      </div>

      <dl className="metric-card__ref">
        <dt>Compared with</dt>
        <dd>
          {ref ? (
            <>
              <strong>{ref.label}: {formatValue(id, ref.value)}</strong>
              <span className={`basis basis--${ref.kind}`}>
                {ref.kind === 'space-model' ? 'Research space model + her own data' : 'Her own history only · no space model'}
              </span>
            </>
          ) : (
            <span className="muted">Not enough readings before launch to make a reliable comparison.</span>
          )}
        </dd>
      </dl>

      {assessment.adaptationUncertain && (
        <p className="cant-tell" role="note">
          <strong>Can't tell:</strong> normal space adaptation and a slow unexplained change look the same in this
          temperature data. BASELINE won't call it normal.
        </p>
      )}

      {!flaggedElsewhere && <p className="metric-card__headline">{assessment.headline}</p>}
      {!flaggedElsewhere && (assessment.status !== 'OK' || defaultOpen) && (
        <p className="metric-card__next">
          <span className="metric-card__next-label">Next step</span> {assessment.nextStep}
        </p>
      )}

      <footer className="metric-card__foot">
        <ConfidenceTag assessment={assessment} inline={!defaultOpen} />
        <div className="metric-card__actions">
          <button type="button" className="btn btn--quiet" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide reasons' : 'Why this result?'}
          </button>
          {showChartButton && (
            <button type="button" className="btn btn--quiet" onClick={() => jumpTo(assessment.missionDay, id, 'measure')}>
              See over time
            </button>
          )}
        </div>
      </footer>
      {open && <WhyCard assessment={assessment} />}
    </article>
  );
}
