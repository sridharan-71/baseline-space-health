import type { Status } from '../../engine/index';
import { STATUS_EXPLAIN, STATUS_PLAIN } from '../plain';

/** Solid colours for chart dots and accents. Text badges use the tinted styles in CSS. */
export const STATUS_COLOR: Record<Status, string> = {
  OK: '#1d7a4b',
  WATCH: '#a35a00',
  ACT: '#b42318',
  UNKNOWN: '#6b7380',
};
export const STATUS_ICON: Record<Status, string> = { OK: '✓', WATCH: '!', ACT: '▲', UNKNOWN: '?' };

export function StatusBadge({ status, large = false }: { status: Status; large?: boolean }) {
  return (
    <span
      className={`status-badge status-badge--${status.toLowerCase()}${large ? ' status-badge--large' : ''}`}
      aria-label={`Status ${status}`}
      title={STATUS_EXPLAIN[status]}
    >
      <span className="status-badge__icon" aria-hidden="true">
        {STATUS_ICON[status]}
      </span>
      {STATUS_PLAIN[status]}
    </span>
  );
}

/** Colour key so first-time viewers can read every badge. */
export function StatusLegend() {
  const order: Status[] = ['OK', 'WATCH', 'ACT', 'UNKNOWN'];
  return (
    <ul className="status-legend">
      {order.map((s) => (
        <li key={s}>
          <StatusBadge status={s} />
          <span>{STATUS_EXPLAIN[s]}</span>
        </li>
      ))}
    </ul>
  );
}
