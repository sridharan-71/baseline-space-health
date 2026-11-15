import type { LensComparison } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { friendlyDay } from '../plain';

/**
 * The same readings judged three ways. Numbers come straight from the engine's
 * compareLenses(); the only arithmetic here is a difference for the takeaway sentence.
 */
export function LensCounts({ lens, currentDay }: { lens: LensComparison; currentDay: number }) {
  const { earth, preflightOnly, baseline } = lens.flagged;
  const extra = preflightOnly - baseline;
  const { setActiveTab } = useMission();
  const hasModel = lens.perDay.some((d) => d.expectedLow !== null);
  return (
    <div className="lens-counts">
      <h3 className="lens-counts__title">Same readings, three ways of judging them</h3>
      <p className="muted small">
        Number of days each method would have raised an alert, out of {lens.daysEvaluated} days in space with a reading (up
        to {friendlyDay(currentDay).toLowerCase()}).
      </p>
      <div className="lens-tiles">
        <div className="lens-tile" data-testid="lens-earth">
          <span className="lens-tile__name">Earth medical limit only</span>
          <span className="lens-tile__how">Alerts only past a general limit used for everyone on Earth.</span>
          {earth === null ? (
            <span className="lens-tile__none">No Earth reference for this measure</span>
          ) : (
            <span className="lens-tile__num">
              <strong>{earth}</strong> days alerted
            </span>
          )}
        </div>
        <div className="lens-tile" data-testid="lens-preflight">
          <span className="lens-tile__name">Her normal before launch only</span>
          <span className="lens-tile__how">Alerts on any change from before launch, including normal space changes.</span>
          <span className="lens-tile__num">
            <strong>{preflightOnly}</strong> days alerted
          </span>
        </div>
        <div className="lens-tile lens-tile--baseline" data-testid="lens-baseline">
          <span className="lens-tile__name">BASELINE</span>
          <span className="lens-tile__how">
            {hasModel
              ? 'Her normal before launch + the change research expects in space, sized to her own data.'
              : 'Her normal before launch + a check that the change lasts. No space model for this measure.'}
          </span>
          <span className="lens-tile__num">
            <strong>{baseline}</strong> days alerted
          </span>
        </div>
      </div>
      <p className="lens-counts__line">
        {extra > 0 && `Using only her pre-launch normal would have raised ${extra} more alerts than BASELINE. `}
        {earth === 0 && baseline > 0 && `Earth limits missed all ${baseline} days that BASELINE flagged. `}
        {hasModel
          ? 'BASELINE allows for the expected space change before deciding a reading is unusual.'
          : 'For this measure BASELINE has no space model, so it relies on her own history and on persistence.'}
      </p>
      <p className="lens-counts__fair small">
        This simulated astronaut follows the research average exactly, which flatters BASELINE.{' '}
        <button
          type="button"
          className="linklike"
          onClick={() => {
            setActiveTab('evidence');
            setTimeout(() => document.getElementById('stress-test')?.scrollIntoView?.({ behavior: 'smooth' }), 50);
          }}
        >
          See the stress test with astronauts who adapt differently →
        </button>
      </p>
    </div>
  );
}
