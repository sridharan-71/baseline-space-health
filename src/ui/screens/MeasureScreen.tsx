import { METRICS, METRIC_ORDER } from '../../engine/index';
import { useDayAssessment, useLens, useMission } from '../../state/MissionContext';
import { DayScrubber } from '../components/DayScrubber';
import { LensCounts } from '../components/LensCounts';
import { MetricCard } from '../components/MetricCard';
import { SameNumberPanel } from '../components/SameNumberPanel';
import { ThreeLensChart } from '../components/ThreeLensChart';
import { SHORT_LABEL, friendlyDay } from '../plain';

export function MeasureScreen() {
  const { selectedMetric, setSelectedMetric, selectedDay, input } = useMission();
  const lens = useLens(selectedMetric);
  const day = useDayAssessment();
  const assessment = day.metrics.find((m) => m.metricId === selectedMetric)!;
  const def = METRICS[selectedMetric];
  const hasModel = lens.perDay.some((d) => d.expectedLow !== null);

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

      <div className="panel">
        <header className="panel__head panel__head--stack">
          <h2 id="measure-title">
            {def.label} <span className="muted">({def.unit})</span>
          </h2>
          <span className={`basis basis--${hasModel ? 'space-model' : 'personal'}`}>
            {hasModel ? 'Research space model + her own data' : 'Her own history only · no space model'}
          </span>
        </header>
        <p className="lead">
          {hasModel
            ? 'Is this change caused by space, or is something really wrong? The blue band is what research expects for her on each day in space.'
            : `There is no research-based space model for ${SHORT_LABEL[selectedMetric].toLowerCase()} in BASELINE, so each reading is compared with her own range before launch.`}
        </p>

        <ul className="chart-key" aria-label="How to read this chart">
          <li><span className="key key--grey" /> Her normal range before launch</li>
          {hasModel && <li><span className="key key--blue" /> Expected range for her in space (research model)</li>}
          <li><span className="key key--red" /> General medical limit used on Earth</li>
          <li><span className="key key--dots"><i className="k-ok" /><i className="k-watch" /><i className="k-act" /></span> Daily readings, coloured by result</li>
        </ul>

        <ThreeLensChart lens={lens} selectedDay={selectedDay} currentDay={input.currentDay} />
        <DayScrubber />
      </div>

      <div className="measure-grid">
        <div>
          <h3 className="section-title">Result for {friendlyDay(selectedDay).toLowerCase()}</h3>
          <MetricCard key={`${selectedMetric}-${selectedDay}`} assessment={assessment} showChartButton={false} defaultOpen />
        </div>
        <div className="panel">
          <LensCounts lens={lens} currentDay={input.currentDay} />
        </div>
      </div>

      {selectedMetric === 'coreTemp' && <SameNumberPanel />}
    </section>
  );
}
