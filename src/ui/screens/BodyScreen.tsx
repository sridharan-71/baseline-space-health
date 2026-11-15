import { useState } from 'react';
import { METRICS, formatDay } from '../../engine/index';
import { useDayAssessment, useMission } from '../../state/MissionContext';
import { BodyMap, REGION_LABEL, type Region } from '../components/BodyMap';
import { ExplainerCard } from '../components/ExplainerCard';

export function BodyScreen() {
  const { selectedDay, stepDay, input } = useMission();
  const day = useDayAssessment();
  const [region, setRegion] = useState<Region | null>(null);
  const shown = region ? day.metrics.filter((m) => METRICS[m.metricId].bodySystem === region) : [];

  return (
    <section className="screen" aria-labelledby="body-title">
      <div className="day-nav">
        <button type="button" className="btn btn--ghost" onClick={() => stepDay(-1)} disabled={selectedDay <= -30} aria-label="Previous day">
          ← Prev
        </button>
        <h2 id="body-title">Body · {formatDay(selectedDay)}</h2>
        <button type="button" className="btn btn--ghost" onClick={() => stepDay(1)} disabled={selectedDay >= input.currentDay} aria-label="Next day">
          Next →
        </button>
      </div>
      <p className="muted">Tap a region to learn about its measures. Colours match the status badges.</p>
      <div className="body-layout">
        <div>
          <BodyMap metrics={day.metrics} selected={region} onSelect={setRegion} />
          <p className="fine-print">Figure is a simplified, original illustration.</p>
        </div>
        <div className="body-details">
          {region ? (
            <>
              <h3>{REGION_LABEL[region]}</h3>
              {shown.map((m) => (
                <ExplainerCard key={m.metricId} assessment={m} />
              ))}
            </>
          ) : (
            <p className="muted">Choose Head, Heart or Whole body.</p>
          )}
        </div>
      </div>
    </section>
  );
}
