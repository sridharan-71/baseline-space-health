import { METRICS, formatDay, formatValue, type DayAssessment } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { CONFIDENCE_WORD, SHORT_LABEL, changeText, referenceFor } from '../plain';
import { StatusBadge } from './StatusBadge';

/**
 * Only the measures that need attention, each answering: what changed, compared with what,
 * over what period, how sure, and what next. Each measure is judged on its own —
 * BASELINE does not combine them into a risk score.
 */
export function AttentionList({ day }: { day: DayAssessment }) {
  const { jumpTo, setActiveTab } = useMission();
  const items = day.metrics
    .filter((m) => m.status === 'ACT' || m.status === 'WATCH')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'ACT' ? -1 : 1));
  const unknown = day.metrics.filter((m) => m.status === 'UNKNOWN');

  return (
    <section className="panel attention" aria-labelledby="attention-title">
      <header className="panel__head">
        <h2 id="attention-title">What needs attention?</h2>
        <span className="panel__meta">{items.length === 0 ? 'Nothing flagged' : `${items.length} of ${day.metrics.length} measures`}</span>
      </header>

      {day.cmoSuggested && (
        <div className="handoff-cta" role="status">
          <p>
            Some readings have been unusual for more than one day. BASELINE has drafted a note for the{' '}
            <strong>crew medical officer</strong> — the crew member trained to give medical care on board.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => setActiveTab('note')}>
            Review the note for {formatDay(day.missionDay)}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="attention__empty">
          {unknown.length === day.metrics.length
            ? 'No readings on this day, so there is nothing to compare. This is not the same as “all normal”.'
            : 'Nothing unusual for her on this day.'}
          {unknown.length > 0 && unknown.length < day.metrics.length &&
            ` ${unknown.length} measure${unknown.length === 1 ? ' has' : 's have'} no reading — see below.`}
        </p>
      ) : (
        <ol className="attention__list">
          {items.map((m) => {
            const ref = referenceFor(m);
            const change = changeText(m);
            const p = m.persistence;
            return (
              <li key={m.metricId} className={`attention-item attention-item--${m.status.toLowerCase()}`}>
                <div className="attention-item__top">
                  <h3>{SHORT_LABEL[m.metricId]}</h3>
                  <StatusBadge status={m.status} />
                </div>
                <p className="attention-item__headline">{m.headline}</p>
                <dl className="facts">
                  <div>
                    <dt>What changed</dt>
                    <dd>
                      {m.value === null ? 'No reading' : formatValue(m.metricId, m.value)}
                      {change ? ` · ${change.arrow} ${change.text}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt>Compared with</dt>
                    <dd>
                      {ref ? `${ref.label} (${formatValue(m.metricId, ref.value)})` : 'Not enough history'}
                      {ref?.kind === 'personal' ? ' — her own history; no space model for this measure' : ''}
                    </dd>
                  </div>
                  <div>
                    <dt>Over what period</dt>
                    <dd>
                      Unusual on {p.flaggedOfLastAvailable} of her last {p.availableInWindow} days with a reading
                      {p.missingInWindow > 0 ? ` (${p.missingInWindow} missing)` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt>How sure</dt>
                    <dd>
                      {CONFIDENCE_WORD[m.confidence]}
                      {m.confidenceReasons.length > 0 ? ` — ${m.confidenceReasons[0]}` : ' — enough history and no missing days'}
                    </dd>
                  </div>
                </dl>
                <p className="attention-item__next">
                  <span className="metric-card__next-label">Next step</span> {m.nextStep}
                </p>
                <button type="button" className="btn btn--quiet" onClick={() => jumpTo(m.missionDay, m.metricId, 'measure')}>
                  See the trend for {METRICS[m.metricId].label.toLowerCase().replace(' (self-rated 1–5)', '')} →
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {items.length > 1 && (
        <p className="fine-print">Each measure is checked on its own. BASELINE does not combine them into a health or risk score.</p>
      )}
    </section>
  );
}
