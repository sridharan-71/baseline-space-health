import { useMemo } from 'react';
import type { LensComparison, MetricId } from '../../engine/index';
import { STATUS_COLOR } from './StatusBadge';

/**
 * Last few days of one measure, drawn from the engine's lens data (no new calculations).
 * Dashed line = the reference the engine compared with (expected in space, or usual before launch).
 */
export function Sparkline({ lens, day, metricId, days = 14 }: { lens: LensComparison; day: number; metricId: MetricId; days?: number }) {
  const pts = useMemo(() => lens.perDay.filter((d) => d.missionDay <= day && d.missionDay > day - days), [lens, day, days]);
  if (pts.length < 2) return null;
  const W = 220, H = 52, P = 5;
  const refOf = (d: (typeof pts)[number]) => d.expectedValue ?? (d.preflightLow + d.preflightHigh) / 2;
  const vals = pts.flatMap((d) => [d.value, refOf(d)].filter((v): v is number => v !== null));
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  const x = (i: number) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v: number) => H - P - ((v - lo) / span) * (H - 2 * P);
  const ref = pts.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(refOf(d)).toFixed(1)}`).join(' ');
  let line = '';
  let pen = false;
  pts.forEach((d, i) => {
    if (d.value === null) { pen = false; return; }
    line += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)} `;
    pen = true;
  });
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Last ${pts.length} days of ${metricId}; dashed line is the comparison value`}>
      <path d={ref} fill="none" stroke="#9aa6b8" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d={line} fill="none" stroke="#24324a" strokeWidth="1.6" />
      {pts.map((d, i) =>
        d.value === null ? (
          <circle key={i} cx={x(i)} cy={H - P} r="2.2" fill="none" stroke="#9aa0aa" strokeDasharray="1.5 1.5" />
        ) : d.baselineStatus !== 'OK' ? (
          <circle key={i} cx={x(i)} cy={y(d.value)} r="2.6" fill={STATUS_COLOR[d.baselineStatus]} />
        ) : null,
      )}
    </svg>
  );
}
