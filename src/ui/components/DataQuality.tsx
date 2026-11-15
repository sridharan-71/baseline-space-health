import { type DayAssessment } from '../../engine/index';
import { CONFIDENCE_WORD, SHORT_LABEL } from '../plain';

/** Is each reading present, and how much can it be trusted? Missing data is never shown as healthy. */
export function DataQuality({ day }: { day: DayAssessment }) {
  return (
    <section className="panel" aria-labelledby="quality-title">
      <header className="panel__head">
        <h2 id="quality-title">Data quality</h2>
        <span className="panel__meta">
          {day.metrics.length - day.unknownCount} of {day.metrics.length} readings available
        </span>
      </header>
      <ul className="quality">
        {day.metrics.map((m) => {
          const missing = m.value === null;
          return (
            <li key={m.metricId} className={`quality__row${missing ? ' quality__row--missing' : ''}`}>
              <span className="quality__name">{SHORT_LABEL[m.metricId]}</span>
              <span className="quality__state">{missing ? 'Missing — not counted as normal' : 'Reading received'}</span>
              <span className={`quality__conf quality__conf--${m.confidence.toLowerCase()}`}>
                {missing ? '—' : `${CONFIDENCE_WORD[m.confidence]} confidence`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
