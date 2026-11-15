import { METRICS, SYMPTOM_LABELS, formatDay } from '../../engine/index';
import { useDayAssessment, useMission } from '../../state/MissionContext';
import { CheckInForm } from '../components/CheckInForm';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

export function TodayScreen() {
  const { input, selectedDay, stepDay, setActiveTab } = useMission();
  const day = useDayAssessment();
  const attention = day.metrics.filter((m) => m.status === 'WATCH' || m.status === 'ACT').length;
  const symptoms = day.selfReport?.symptoms ?? [];

  return (
    <section className="screen" aria-labelledby="today-title">
      <div className="day-nav">
        <button type="button" className="btn btn--ghost" onClick={() => stepDay(-1)} disabled={selectedDay <= -30} aria-label="Previous day">
          ← Prev
        </button>
        <h2 id="today-title">
          {formatDay(selectedDay)} · {input.astronaut.displayName}
        </h2>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => stepDay(1)}
          disabled={selectedDay >= input.currentDay}
          aria-label="Next day"
        >
          Next →
        </button>
      </div>

      <div className="overall">
        <StatusBadge status={day.overall} large />
        <div>
          <p className="overall__summary">
            {attention > 0
              ? `${attention} measure${attention === 1 ? ' needs' : 's need'} attention`
              : day.unknownCount === day.metrics.length
                ? 'No data for this day'
                : 'All measures as expected'}
          </p>
          {day.unknownCount > 0 && day.unknownCount < day.metrics.length && (
            <p className="muted">
              {day.unknownCount} measure{day.unknownCount === 1 ? ' has' : 's have'} no data
            </p>
          )}
          {selectedDay === input.currentDay && <p className="muted">Mission “today” in the simulation.</p>}
        </div>
      </div>

      {day.cmoSuggested && (
        <div className="callout" role="status">
          <p>Consider contacting your crew medical officer — a draft note is ready.</p>
          <button type="button" className="btn btn--primary" onClick={() => setActiveTab('note')}>
            Open CMO note
          </button>
        </div>
      )}

      <div className="card-grid">
        {day.metrics.map((m) => (
          <MetricCard key={`${m.metricId}-${selectedDay}`} assessment={m} />
        ))}
      </div>

      <div className="self-report">
        <h3>Self-report</h3>
        {symptoms.length > 0 ? (
          <p>
            Reported: {symptoms.map((s) => SYMPTOM_LABELS[s]).join(', ')}
            {day.selfReport?.note ? ` — “${day.selfReport.note}”` : ''}
          </p>
        ) : (
          <p className="muted">No symptoms reported for {formatDay(selectedDay)}.</p>
        )}
        <p className="fine-print">{METRICS.mood.explainer.whenToContactCmo}</p>
      </div>

      <CheckInForm key={selectedDay} day={selectedDay} />
    </section>
  );
}
