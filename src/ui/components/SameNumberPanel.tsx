import { useMemo } from 'react';
import { formatValue } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { friendlyDay } from '../plain';
import { assessWhatIf } from '../whatIf';
import { StatusBadge } from './StatusBadge';

const VALUE = 37.6;
const DAYS = [4, 90];

/** One simulated temperature, judged by the real engine on two different mission days. */
export function SameNumberPanel() {
  const { input } = useMission();
  const results = useMemo(() => DAYS.map((d) => assessWhatIf(input, 'coreTemp', d, VALUE)), [input]);
  return (
    <section className="card same" aria-labelledby="same-title">
      <header className="same__head">
        <h2 id="same-title">Same number, different meaning</h2>
        <p className="same__tag">Same temperature. Different mission context. Different interpretation.</p>
      </header>
      <div className="same__grid">
        {results.map((a, i) => {
          const z = a.zExpected ?? a.zPreflight;
          return (
            <article key={a.missionDay} className={`same__card same__card--${a.status.toLowerCase()}`}>
              <p className="same__day">{friendlyDay(a.missionDay)}</p>
              <p className="same__value">{formatValue('coreTemp', VALUE)}</p>
              <dl className="same__facts">
                <div>
                  <dt>Expected for her</dt>
                  <dd>{a.expected ? formatValue('coreTemp', a.expected.value) : '—'}</dd>
                </div>
                <div>
                  <dt>Deviation</dt>
                  <dd>{z === null ? '—' : `${z > 0 ? '+' : '−'}${Math.abs(z).toFixed(1)} SD`}</dd>
                </div>
              </dl>
              <StatusBadge status={a.status} large />
              {i === 0 && <span className="same__vs" aria-hidden="true">vs</span>}
            </article>
          );
        })}
      </div>
      <p className="fine-print">
        Live engine result on a simulated reading. SD = her usual day-to-day variation. Expected values use the ISS
        temperature trend (Stahn et al. 2017) sized to her own data — only temperature has a space model.
      </p>
    </section>
  );
}
