import type { KeyboardEvent } from 'react';
import { METRICS, type MetricAssessment, type MetricDefinition, type Status } from '../../engine/index';
import { STATUS_COLOR } from './StatusBadge';

export type Region = MetricDefinition['bodySystem'];

export const REGION_LABEL: Record<Region, string> = { brain: 'Head', heart: 'Heart', 'whole-body': 'Whole body' };

// Display-only ordering for colouring a region by its worst status. This is the ONLY status ordering in ui/,
// and it never changes any assessment: ACT > WATCH > UNKNOWN > OK.
const COLOUR_RANK: Record<Status, number> = { OK: 0, UNKNOWN: 1, WATCH: 2, ACT: 3 };

export function regionStatus(metrics: MetricAssessment[], region: Region): Status {
  const inRegion = metrics.filter((m) => METRICS[m.metricId].bodySystem === region);
  return inRegion.reduce<Status>((w, m) => (COLOUR_RANK[m.status] > COLOUR_RANK[w] ? m.status : w), 'OK');
}

export function BodyMap({
  metrics,
  selected,
  onSelect,
}: {
  metrics: MetricAssessment[];
  selected: Region | null;
  onSelect: (r: Region) => void;
}) {
  const status = (r: Region) => regionStatus(metrics, r);
  const props = (r: Region) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': `${REGION_LABEL[r]} — status ${status(r)} — open details`,
    'aria-pressed': selected === r,
    className: `body-region${selected === r ? ' body-region--on' : ''}`,
    onClick: () => onSelect(r),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(r);
      }
    },
  });

  return (
    <svg viewBox="0 0 320 420" className="body-map" role="group" aria-label="Simplified body figure">
      {/* Whole body: an original, simple rounded figure */}
      <g {...props('whole-body')}>
        <title>Whole body</title>
        <g fill={STATUS_COLOR[status('whole-body')]} fillOpacity={0.28} stroke={STATUS_COLOR[status('whole-body')]} strokeWidth={3}>
          <rect x="88" y="78" width="24" height="18" rx="6" />
          <rect x="60" y="94" width="80" height="140" rx="30" />
          <rect x="30" y="100" width="24" height="130" rx="12" transform="rotate(8 42 100)" />
          <rect x="146" y="100" width="24" height="130" rx="12" transform="rotate(-8 158 100)" />
          <rect x="66" y="226" width="30" height="170" rx="14" />
          <rect x="104" y="226" width="30" height="170" rx="14" />
        </g>
      </g>
      {/* Head = brain */}
      <g {...props('brain')}>
        <title>Head</title>
        <circle cx="100" cy="46" r="32" fill={STATUS_COLOR[status('brain')]} fillOpacity={0.85} stroke="#202124" strokeWidth={2} />
      </g>
      {/* Chest = heart */}
      <g {...props('heart')}>
        <title>Heart</title>
        <path
          d="M100 160 C 70 140, 76 112, 92 114 C 97 115, 100 120, 100 124 C 100 120, 103 115, 108 114 C 124 112, 130 140, 100 160 Z"
          fill={STATUS_COLOR[status('heart')]}
          stroke="#202124"
          strokeWidth={2}
        />
      </g>
      {/* Text labels (status in words, not colour alone) */}
      <g fontSize="14" fill="#202124" fontFamily="inherit">
        <line x1="134" y1="46" x2="196" y2="46" stroke="#5f6368" />
        <text x="200" y="50">Head: {status('brain')}</text>
        <line x1="128" y1="134" x2="196" y2="134" stroke="#5f6368" />
        <text x="200" y="138">Heart: {status('heart')}</text>
        <line x1="138" y1="260" x2="196" y2="260" stroke="#5f6368" />
        <text x="200" y="264">Whole body: {status('whole-body')}</text>
      </g>
    </svg>
  );
}
