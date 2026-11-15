import { formatDay, type DayAssessment } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { CONFIDENCE_WORD, SHORT_LABEL, changeText } from '../plain';
import { Icon, MetricIcon } from './Icons';
import { StatusBadge } from './StatusBadge';

/** Compact list of the measures that need attention. Details live behind each card's "Why this result?". */
export function AttentionList({ day }: { day: DayAssessment }) {
  const { jumpTo, setActiveTab } = useMission();
  const items = day.metrics
    .filter((m) => m.status === 'ACT' || m.status === 'WATCH')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'ACT' ? -1 : 1));
  const unknown = day.metrics.filter((m) => m.status === 'UNKNOWN');

  return (
    <section className="card attention" aria-labelledby="attention-title">
      <header className="card__head">
        <h2 id="attention-title">What needs attention?</h2>
        <span className="card__meta">{items.length === 0 ? 'Nothing flagged' : `${items.length} of ${day.metrics.length}`}</span>
      </header>

      {items.length === 0 ? (
        <p className="attention__empty">
          {unknown.length === day.metrics.length
            ? 'No readings on this day — that is not the same as “all normal”.'
            : 'Nothing unusual for her on this day.'}
          {unknown.length > 0 && unknown.length < day.metrics.length && ` ${unknown.length} measure${unknown.length === 1 ? ' has' : 's have'} no reading.`}
        </p>
      ) : (
        <ul className="attention__list">
          {items.map((m) => {
            const c = changeText(m);
            const p = m.persistence;
            return (
              <li key={m.metricId}>
                <button type="button" className={`attn attn--${m.status.toLowerCase()}`} onClick={() => jumpTo(m.missionDay, m.metricId, 'measure')}>
                  <MetricIcon id={m.metricId} size={34} />
                  <span className="attn__main">
                    <span className="attn__name">{SHORT_LABEL[m.metricId]}</span>
                    <span className="attn__detail">
                      {c ? `${c.arrow} ${c.text.replace(' for you today', '').replace(' your usual before launch', ' usual')}` : 'No reading'}
                      {' · '}
                      {p.flaggedOfLastAvailable} of last {p.availableInWindow} days
                      {' · '}
                      {CONFIDENCE_WORD[m.confidence]} confidence
                    </span>
                  </span>
                  <StatusBadge status={m.status} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {day.cmoSuggested && (
        <div className="handoff-cta" role="status">
          <span className="handoff-cta__icon"><Icon name="doc" size={22} /></span>
          <p>
            Unusual for more than one day. BASELINE has drafted a note for the <strong>crew medical officer</strong>.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => setActiveTab('note')}>
            Review note · {formatDay(day.missionDay)}
          </button>
        </div>
      )}
      {items.length > 1 && <p className="fine-print">Each measure is checked on its own — no combined risk score.</p>}
    </section>
  );
}
