import { useMemo } from 'react';
import { ROLLING_WINDOW_DAYS, rollingFlags, type LensComparison } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { SHORT_LABEL } from '../plain';

interface Method {
  id: string;
  name: string;
  count: number | null;
  none?: string;
  how: string;
  means: string;
  ours?: boolean;
}

/**
 * The same readings judged four ways. Counts come from the engine (compareLenses, rollingFlags);
 * the only arithmetic here is bar widths.
 */
export function LensCounts({ lens, currentDay }: { lens: LensComparison; currentDay: number }) {
  const { input, setActiveTab } = useMission();
  const { earth, preflightOnly, baseline } = lens.flagged;
  const hasModel = lens.perDay.some((d) => d.expectedLow !== null);
  const isTemp = lens.metricId === 'coreTemp';
  const rolling = useMemo(() => (isTemp ? rollingFlags(input, currentDay).size : null), [input, currentDay, isTemp]);
  const total = lens.daysEvaluated;

  const methods: Method[] = [
    {
      id: 'earth', name: 'Earth limit only', count: earth, none: 'No Earth reference for this measure',
      how: 'A general limit for everyone on Earth.',
      means: 'Misses changes that are unusual for her but stay below the general limit.',
    },
    {
      id: 'preflight', name: 'Pre-launch normal only', count: preflightOnly,
      how: 'Any change from her pre-launch range.',
      means: hasModel ? 'Treats the expected space rise as a problem, so it flags many normal days.' : 'For this measure it is close to what BASELINE does, minus the persistence check.',
    },
    {
      id: 'rolling', name: `Last ${ROLLING_WINDOW_DAYS} days only`, count: rolling, none: 'Calculated for temperature only',
      how: `Compares each day with her previous ${ROLLING_WINDOW_DAYS} days.`,
      means: 'Keeps up with change, but also slowly absorbs a slow drift (see the stress test).',
    },
    {
      id: 'baseline', name: 'BASELINE', count: baseline, ours: true,
      how: hasModel ? 'Her history + the expected space change, sized to her data.' : 'Her own history + a check that it lasts. No space model.',
      means: hasModel ? 'Allows for the expected rise before calling a reading unusual.' : 'Relies on her own history and persistence.',
    },
  ];
  const max = Math.max(1, ...methods.map((m) => m.count ?? 0));

  return (
    <div className="compare">
      <header className="compare__head">
        <div>
          <h3 className="compare__title">Same readings, four ways of judging them</h3>
          <p className="muted small">
            Days each method would raise an alert, out of {total} days in space with a {SHORT_LABEL[lens.metricId].toLowerCase()} reading.
          </p>
        </div>
      </header>
      <div className="compare__grid">
        {methods.map((m) => (
          <div key={m.id} className={`method${m.ours ? ' method--ours' : ''}`} data-testid={`lens-${m.id}`}>
            <p className="method__name">{m.name}</p>
            {m.count === null ? (
              <p className="method__none">{m.none}</p>
            ) : (
              <>
                <p className="method__num">
                  <strong>{m.count}</strong> <span>days flagged</span>
                </p>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${(m.count / max) * 100}%` }} />
                </div>
              </>
            )}
            <p className="method__how">{m.how}</p>
            <p className="method__means">{m.means}</p>
          </div>
        ))}
      </div>
      <div className="takeaway">
        <p>
          <strong>What does this tell us?</strong> The same data gives very different answers depending on what you compare
          with. Fewer alerts is not automatically better — the question is whether the alerts land on real problems.
        </p>
        <p className="takeaway__warn">
          Simulated data. This astronaut was built to follow the research average exactly, which flatters BASELINE. These
          counts are not a validated false-alarm rate.{' '}
          <button
            type="button"
            className="linklike"
            onClick={() => {
              setActiveTab('evidence');
              setTimeout(() => document.getElementById('stress-test')?.scrollIntoView?.({ behavior: 'smooth' }), 50);
            }}
          >
            See the stress test →
          </button>
        </p>
      </div>
    </div>
  );
}
