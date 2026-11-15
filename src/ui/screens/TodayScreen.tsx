import { SYMPTOM_LABELS } from '../../engine/index';
import { useDayAssessment, useMission } from '../../state/MissionContext';
import { AttentionList } from '../components/AttentionList';
import { CheckInForm } from '../components/CheckInForm';
import { DataQuality } from '../components/DataQuality';
import { DayStepper } from '../components/DayStepper';
import { IntroPanel } from '../components/IntroPanel';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { friendlyDay } from '../plain';

export function TodayScreen({ onStartDemo }: { onStartDemo?: () => void }) {
  const { input, selectedDay } = useMission();
  const day = useDayAssessment();
  const attention = day.metrics.filter((m) => m.status === 'WATCH' || m.status === 'ACT').length;
  const symptoms = day.selfReport?.symptoms ?? [];
  const name = input.astronaut.displayName.replace(/\s*\(SIMULATED\)\s*/i, '');
  const summary =
    day.unknownCount === day.metrics.length
      ? 'No readings on this day — BASELINE will not guess.'
      : attention > 0
        ? `${attention} of ${day.metrics.length} measures look unusual for her today.`
        : 'Everything looks as expected for her on this day in space.';

  return (
    <section className="screen" aria-labelledby="today-title">
      <IntroPanel onStartDemo={onStartDemo} />

      <header className={`hero hero--${day.overall.toLowerCase()}`}>
        <div className="hero__who">
          <span className="avatar" aria-hidden="true">AR</span>
          <div>
            <h2 id="today-title">
              {friendlyDay(selectedDay)} · {input.astronaut.displayName}
            </h2>
            <p className="hero__sub">
              {name} · fictional long-duration mission · simulated data
            </p>
          </div>
        </div>
        <DayStepper />
        <div className="hero__status">
          <StatusBadge status={day.overall} large />
          <p className="hero__summary">{summary}</p>
          {day.unknownCount > 0 && day.unknownCount < day.metrics.length && (
            <p className="hero__note">
              {day.unknownCount} measure{day.unknownCount === 1 ? ' has' : 's have'} no reading — shown as “No data”, never as normal.
            </p>
          )}
        </div>
      </header>

      <div className="today-grid">
        <div className="today-grid__main">
          <AttentionList day={day} />
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="section-title">All measures</h2>
            <div className="card-grid">
              {day.metrics.map((m) => (
                <MetricCard key={`${m.metricId}-${selectedDay}`} assessment={m} compact />
              ))}
            </div>
          </section>
        </div>
        <aside className="today-grid__side">
          <DataQuality day={day} />
          <section className="panel" aria-labelledby="feel-title">
            <header className="panel__head">
              <h2 id="feel-title">How she said she feels</h2>
            </header>
            {symptoms.length > 0 ? (
              <p>
                {symptoms.map((s) => SYMPTOM_LABELS[s]).join(', ')}
                {day.selfReport?.note ? ` — “${day.selfReport.note}”` : ''}
              </p>
            ) : (
              <p className="muted">No symptoms reported on this day.</p>
            )}
            <p className="fine-print">Feeling unwell is always a reason to contact the crew medical officer — with or without the app.</p>
          </section>
          <CheckInForm key={selectedDay} day={selectedDay} />
        </aside>
      </div>
    </section>
  );
}
