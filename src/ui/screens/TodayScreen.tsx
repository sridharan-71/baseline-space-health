import { SYMPTOM_LABELS } from '../../engine/index';
import { useDayAssessment, useMission } from '../../state/MissionContext';
import { AttentionList } from '../components/AttentionList';
import { CheckInForm } from '../components/CheckInForm';
import { DataQuality } from '../components/DataQuality';
import { DayStepper } from '../components/DayStepper';
import { IntroPanel } from '../components/IntroPanel';
import { MetricCard } from '../components/MetricCard';
import { STATUS_ICON } from '../components/StatusBadge';
import { STATUS_PLAIN, friendlyDay } from '../plain';

export function TodayScreen({ onStartDemo }: { onStartDemo?: () => void }) {
  const { input, selectedDay } = useMission();
  const day = useDayAssessment();
  const attention = day.metrics.filter((m) => m.status === 'WATCH' || m.status === 'ACT').length;
  const symptoms = day.selfReport?.symptoms ?? [];
  const name = input.astronaut.displayName.replace(/\s*\(SIMULATED\)\s*/i, '');
  const summary =
    day.unknownCount === day.metrics.length
      ? 'No readings — BASELINE will not guess.'
      : attention > 0
        ? `${attention} of ${day.metrics.length} measures look unusual for her today.`
        : 'Everything looks as expected for her today.';
  const st = day.overall.toLowerCase();

  return (
    <section className="screen" aria-labelledby="today-title">
      <IntroPanel onStartDemo={onStartDemo} />

      <div className="overview">
        <div className="card overview__who">
          <span className="avatar" aria-hidden="true">AR</span>
          <div className="overview__id">
            <h2 id="today-title">
              <span className="visually-hidden">{friendlyDay(selectedDay)} · {input.astronaut.displayName}</span>
              <span aria-hidden="true">{name}</span>
            </h2>
            <p className="overview__meta">
              <span className="pill pill--sim">SIMULATED</span> Commander · long-duration mission
            </p>
          </div>
          <DayStepper />
        </div>
        <div className={`card overall overall--${st}`} aria-live="polite">
          <span className="overall__icon" aria-hidden="true">{STATUS_ICON[day.overall]}</span>
          <div>
            <p className="eyebrow">Overall · {friendlyDay(selectedDay)}</p>
            <p className="overall__word" aria-label={`Status ${day.overall}`}>{STATUS_PLAIN[day.overall]}</p>
            <p className="overall__sum">{summary}</p>
            {day.unknownCount > 0 && day.unknownCount < day.metrics.length && (
              <p className="overall__note">{day.unknownCount} measure{day.unknownCount === 1 ? '' : 's'} with no reading — shown as “No data”, never as normal.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-grid">
        {day.metrics.map((m) => (
          <MetricCard key={`${m.metricId}-${selectedDay}`} assessment={m} />
        ))}
      </div>

      <AttentionList day={day} />

      <div className="support-grid">
        <DataQuality day={day} />
        <section className="card" aria-labelledby="feel-title">
          <header className="card__head">
            <h2 id="feel-title">How she said she feels</h2>
          </header>
          {symptoms.length > 0 ? (
            <ul className="tags">
              {symptoms.map((s) => (
                <li key={s} className="tag">{SYMPTOM_LABELS[s]}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No symptoms reported on this day.</p>
          )}
          {day.selfReport?.note && <p className="quote">“{day.selfReport.note}”</p>}
          <p className="fine-print">Feeling unwell is always a reason to contact the crew medical officer — with or without the app.</p>
        </section>
        <CheckInForm key={selectedDay} day={selectedDay} />
      </div>
    </section>
  );
}
