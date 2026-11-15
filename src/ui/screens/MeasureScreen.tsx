import { METRICS, METRIC_ORDER } from '../../engine/index';
import { useDayAssessment, useLens, useMission } from '../../state/MissionContext';
import { DayScrubber } from '../components/DayScrubber';
import { LensCounts } from '../components/LensCounts';
import { MetricCard } from '../components/MetricCard';
import { ThreeLensChart } from '../components/ThreeLensChart';

export function MeasureScreen() {
  const { selectedMetric, setSelectedMetric, selectedDay, input } = useMission();
  const lens = useLens(selectedMetric);
  const day = useDayAssessment();
  const assessment = day.metrics.find((m) => m.metricId === selectedMetric)!;
  const def = METRICS[selectedMetric];

  return (
    <section className="screen" aria-labelledby="measure-title">
      <div className="segmented" role="group" aria-label="Choose a measure">
        {METRIC_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={`segmented__btn${selectedMetric === id ? ' segmented__btn--on' : ''}`}
            aria-pressed={selectedMetric === id}
            onClick={() => setSelectedMetric(id)}
          >
            {METRICS[id].label.replace(' (self-rated 1–5)', '')}
          </button>
        ))}
      </div>
      <h2 id="measure-title">
        {def.label} <span className="muted">({def.unit})</span>
      </h2>
      <p className="lens-question">Is this space, or is this me?</p>

      <ThreeLensChart lens={lens} selectedDay={selectedDay} currentDay={input.currentDay} />
      <LensCounts lens={lens} currentDay={input.currentDay} />
      <DayScrubber />
      <MetricCard key={`${selectedMetric}-${selectedDay}`} assessment={assessment} showChartButton={false} defaultOpen />
    </section>
  );
}
