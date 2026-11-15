import { type DayAssessment } from '../../engine/index';
import { CONFIDENCE_WORD, SHORT_LABEL } from '../plain';
import { MetricIcon } from './Icons';

/** Is each reading present, and how much can it be trusted? Missing data is never shown as healthy. */
export function DataQuality({ day }: { day: DayAssessment }) {
  return (
    <section className="card" aria-labelledby="quality-title">
      <header className="card__head">
        <h2 id="quality-title">Data quality</h2>
        <span className="card__meta">
          {day.metrics.length - day.unknownCount}/{day.metrics.length} readings
        </span>
      </header>
      <ul className="quality">
        {day.metrics.map((m) => {
          const missing = m.value === null;
          return (
            <li key={m.metricId} className={`quality__row${missing ? ' quality__row--missing' : ''}`}>
              <MetricIcon id={m.metricId} size={26} />
              <span className="quality__name">{SHORT_LABEL[m.metricId]}</span>
              <span className={`quality__pill quality__pill--${missing ? 'missing' : m.confidence.toLowerCase()}`}>
                {missing ? 'Missing' : CONFIDENCE_WORD[m.confidence]}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="fine-print">Pill = how sure BASELINE is. Missing readings are never counted as normal.</p>
    </section>
  );
}
