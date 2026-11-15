import type { Status } from '../../engine/index';

export const STATUS_COLOR: Record<Status, string> = {
  OK: '#1f7a3a',
  WATCH: '#a15c00',
  ACT: '#b3261e',
  UNKNOWN: '#5f6368',
};
const ICON: Record<Status, string> = { OK: '✓', WATCH: '!', ACT: '▲', UNKNOWN: '?' };

export function StatusBadge({ status, large = false }: { status: Status; large?: boolean }) {
  return (
    <span
      className={`status-badge${large ? ' status-badge--large' : ''}`}
      style={{ background: STATUS_COLOR[status] }}
      aria-label={`Status ${status}`}
    >
      <span aria-hidden="true">{ICON[status]}</span> {status}
    </span>
  );
}
