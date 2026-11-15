import { METRICS, METRIC_ORDER } from '../../engine/index';
import { useDayAssessment, useLens, useMission } from '../../state/MissionContext';
import { DayScrubber } from '../components/DayScrubber';
import { MetricIcon } from '../components/Icons';
import { LensCounts } from '../components/LensCounts';
import { MetricCard } from '../components/MetricCard';
import { SameNumberPanel } from '../components/SameNumberPanel';
import { ThreeLensChart } from '../components/ThreeLensChart';
import { friendlyDay } from '../plain';

export function MeasureScreen() {
  const { selectedMetric, setSelectedMetric, selectedDay, input } = useMission();
  const lens = useLens(selectedMetric);
  const day = useDayAssessment();
  const assessment = day.metrics.find((m) => m.metricId === selectedMetric)!;
  const def = METRICS[selectedMetric];
  const hasModel = lens.perDay.some((d) => d.expectedLow !== null);

  return (
    <section className="screen" aria-labelledby="measure-title">
      <div className="measure-pick" role="group" aria-label="Choose a measure">
        {METRIC_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={`measure-pick__btn${selectedMetric === id ? ' measure-pick__btn--on' : ''}`}
            aria-pressed={selectedMetric === id}
            onClick={() => setSelectedMetric(id)}
          >
            <MetricIcon id={id} size={28} />
            {METRICS[id].label.replace(' (self-rated 1–5)', '')}
          </button>
        ))}
      </div>

      <div className="card">
        <header className="chart-head">
          <div>
            <h2 id="measure-title">
              {def.label} <span className="muted">({def.unit})</span>
            </h2>
            <p className="muted">
              {hasModel ? 'Is this change caused by space, or is something wrong?' : 'Compared with her own pre-launch range only.'}
            </p>
          </div>
          <span className={`basis basis--${hasModel ? 'space-model' : 'personal'} basis--lg`}>
            {hasModel ? 'Research space model + her data' : 'Own history only · no space model'}
          </span>
        </header>

        <ul className="legend" aria-label="How to read this chart">
          <li><span className="key key--grey" /> Her pre-launch range</li>
          {hasModel ? (
            <li><span className="key key--blue" /> Expected range in space</li>
          ) : (
            <li className="legend__off"><span className="key key--off" /> No expected-space band</li>
          )}
          <li><span className="key key--red" /> Earth limit</li>
          <li><span className="key key--dots"><i className="k-ok" /><i className="k-watch" /><i className="k-act" /></span> Daily result</li>
        </ul>

        <ThreeLensChart lens={lens} selectedDay={selectedDay} currentDay={input.currentDay} />
        <DayScrubber />
      </div>

      {selectedMetric === 'coreTemp' && <SameNumberPanel />}

      <div className="measure-grid">
        <div>
          <h3 className="section-title">Result · {friendlyDay(selectedDay)}</h3>
          <MetricCard key={`${selectedMetric}-${selectedDay}`} assessment={assessment} showChartButton={false} defaultOpen />
        </div>
        <div className="card">
          <LensCounts lens={lens} currentDay={input.currentDay} />
        </div>
      </div>

    </section>
  );
}
