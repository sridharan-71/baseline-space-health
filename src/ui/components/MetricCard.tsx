import { useEffect, useRef, useState } from 'react';
import { METRICS, formatValue, type MetricAssessment } from '../../engine/index';
import { useLens, useMission } from '../../state/MissionContext';
import { SHORT_LABEL, changeText, referenceFor, friendlyDay } from '../plain';
import { ConfidenceTag } from './ConfidenceTag';
import { MetricIcon } from './Icons';
import { Sparkline } from './Sparkline';
import { StatusBadge } from './StatusBadge';
import { WhyCard } from './WhyCard';

/** Reasons in a dialog, so the card itself stays short. */
function WhyDialog({ assessment, onClose }: { assessment: MetricAssessment; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const titleId = `why-${assessment.metricId}`;
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <header className="dialog__head">
          <div>
            <p className="eyebrow">{friendlyDay(assessment.missionDay)}</p>
            <h3 id={titleId}>Why: {SHORT_LABEL[assessment.metricId]}</h3>
          </div>
          <button ref={closeRef} type="button" className="btn btn--icon" onClick={onClose} aria-label="Close reasons">
            ✕
          </button>
        </header>
        <p className="dialog__headline">{assessment.headline}</p>
        <p className="next">
          <span className="next__label">Next step</span> {assessment.nextStep}
        </p>
        <ConfidenceTag assessment={assessment} />
        <WhyCard assessment={assessment} />
      </div>
    </div>
  );
}

/** One measure on one day. Compact on Today; full (with reasons open) on Over time. */
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
  const lens = useLens(assessment.metricId);
  const [open, setOpen] = useState(false);
  const full = defaultOpen;
  const def = METRICS[assessment.metricId];
  const id = assessment.metricId;
  const ref = referenceFor(assessment);
  const change = changeText(assessment);
  const st = assessment.status.toLowerCase();

  return (
    <article className={`metric-card metric-card--${st}${full ? ' metric-card--full' : ''}`} aria-label={`${def.label} card`} data-testid={`card-${id}`}>
      <header className="metric-card__head">
        <MetricIcon id={id} size={36} />
        <h3>{SHORT_LABEL[id]}</h3>
        <StatusBadge status={assessment.status} />
      </header>

      {assessment.value === null ? (
        <p className="metric-card__value metric-card__value--none">No reading</p>
      ) : (
        <p className="metric-card__value">{formatValue(id, assessment.value)}</p>
      )}

      {change ? (
        <p className={`metric-card__change metric-card__change--${st}`}>
          <span aria-hidden="true">{change.arrow}</span> {change.text.replace(' for you today', '').replace(' your usual before launch', ' usual')}
        </p>
      ) : (
        <p className="metric-card__change">Nothing to compare — shown as “No data”, never as normal.</p>
      )}

      <p className="metric-card__ref">
        {ref ? (
          <>
            {ref.kind === 'space-model' ? 'Expected today' : 'Usual before launch'}: <strong>{formatValue(id, ref.value)}</strong>
            <span className={`basis basis--${ref.kind}`}>{ref.kind === 'space-model' ? 'Space model' : 'Own history'}</span>
          </>
        ) : (
          <span className="muted">Not enough readings before launch.</span>
        )}
      </p>

      {!full && <Sparkline lens={lens} day={assessment.missionDay} metricId={id} />}

      {assessment.adaptationUncertain && (
        <p className="cant-tell" role="note">
          <strong>Can't tell</strong> normal adaptation from a slow change here — BASELINE won't call it normal.
        </p>
      )}

      {full && (
        <>
          <p className="metric-card__headline">{assessment.headline}</p>
          <p className="next">
            <span className="next__label">Next step</span> {assessment.nextStep}
          </p>
        </>
      )}

      <footer className="metric-card__foot">
        <ConfidenceTag assessment={assessment} inline={!full} />
        <div className="metric-card__actions">
          {!full && (
            <button type="button" className="btn btn--quiet" aria-expanded={open} onClick={() => setOpen(true)}>
              Why this result?
            </button>
          )}
          {showChartButton && (
            <button type="button" className="btn btn--quiet" aria-label="See over time" onClick={() => jumpTo(assessment.missionDay, id, 'measure')}>
              Trend →
            </button>
          )}
        </div>
      </footer>
      {full && <WhyCard assessment={assessment} />}
      {open && <WhyDialog assessment={assessment} onClose={() => setOpen(false)} />}
    </article>
  );
}
