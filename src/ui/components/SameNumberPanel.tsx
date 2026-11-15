import { useMemo } from 'react';
import { formatValue } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { STATUS_EXPLAIN, friendlyDay } from '../plain';
import { assessWhatIf } from '../whatIf';
import { StatusBadge } from './StatusBadge';

const VALUE = 37.6;
const DAYS = [4, 90];

/** One simulated temperature, judged by the real engine on two different mission days. */
export function SameNumberPanel() {
  const { input } = useMission();
  const results = useMemo(() => DAYS.map((d) => assessWhatIf(input, 'coreTemp', d, VALUE)), [input]);
  return (
    <section className="panel same" aria-labelledby="same-title">
      <header className="panel__head">
        <h2 id="same-title">Same number, different meaning</h2>
        <span className="panel__meta">Live engine result · simulated reading</span>
      </header>
      <p className="muted">
        What if she measured <strong>{formatValue('coreTemp', VALUE)}</strong> on two different days? BASELINE gives two
        different answers, because what is normal for her changes during the mission.
      </p>
      <div className="same__grid">
        {results.map((a) => {
          const z = a.zExpected ?? a.zPreflight;
          return (
            <article key={a.missionDay} className={`same__card same__card--${a.status.toLowerCase()}`}>
              <p className="same__day">{friendlyDay(a.missionDay)}</p>
              <p className="same__value">{formatValue('coreTemp', VALUE)}</p>
              <dl className="same__facts">
                <div>
                  <dt>Expected for her that day</dt>
                  <dd>{a.expected ? formatValue('coreTemp', a.expected.value) : '—'}</dd>
                </div>
                <div>
                  <dt>Distance from expected</dt>
                  <dd>{z === null ? '—' : `${z > 0 ? '+' : ''}${z.toFixed(1)} × her usual wobble`}</dd>
                </div>
              </dl>
              <StatusBadge status={a.status} large />
              <p className="same__why">{STATUS_EXPLAIN[a.status]}</p>
            </article>
          );
        })}
      </div>
      <p className="fine-print">
        Uses the published ISS temperature trend (Stahn et al. 2017), sized to her own in-flight data. Only core
        temperature has a research-based space model in BASELINE.
      </p>
    </section>
  );
}
