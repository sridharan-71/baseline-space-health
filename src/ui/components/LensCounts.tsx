import { formatDay, type LensComparison } from '../../engine/index';

export function LensCounts({ lens, currentDay }: { lens: LensComparison; currentDay: number }) {
  const { earth, preflightOnly, baseline } = lens.flagged;
  return (
    <div className="lens-counts">
      <div className="lens-tiles">
        <div className="lens-tile" data-testid="lens-earth">
          <span className="lens-tile__icon" aria-hidden="true">🌍</span>
          <span className="lens-tile__name">Earth reference</span>
          {earth === null ? (
            <span className="lens-tile__none">No Earth reference for this measure</span>
          ) : (
            <span className="lens-tile__num">
              <strong>{earth}</strong> days flagged
            </span>
          )}
        </div>
        <div className="lens-tile" data-testid="lens-preflight">
          <span className="lens-tile__icon" aria-hidden="true">🧑‍🚀</span>
          <span className="lens-tile__name">Pre-flight normal only</span>
          <span className="lens-tile__num">
            <strong>{preflightOnly}</strong> days flagged
          </span>
        </div>
        <div className="lens-tile lens-tile--baseline" data-testid="lens-baseline">
          <span className="lens-tile__icon" aria-hidden="true">🛰️</span>
          <span className="lens-tile__name">BASELINE (expected in-flight)</span>
          <span className="lens-tile__num">
            <strong>{baseline}</strong> days flagged
          </span>
        </div>
      </div>
      <p className="lens-counts__sub">
        of {lens.daysEvaluated} in-flight days with data, up to {formatDay(currentDay)}
      </p>
      <p className="lens-counts__line">
        Different lenses, different answers — BASELINE separates expected space adaptation from unexplained change.
      </p>
    </div>
  );
}
