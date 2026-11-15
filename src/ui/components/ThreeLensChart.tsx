import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EARTH_REFERENCES, METRICS, formatDay, formatValue, type LensComparison, type Status } from '../../engine/index';
import { STATUS_COLOR } from './StatusBadge';
import { STATUS_PLAIN, friendlyDay } from '../plain';

interface Point {
  day: number;
  value: number | null;
  preBand: [number, number];
  expBand: [number, number] | null;
  status: Status;
  preflightFlag: boolean | null;
  earthFlag: boolean | null;
}

const YES_NO = (b: boolean | null) => (b === null ? 'n/a' : b ? 'yes' : 'no');

function ChartTooltip({ active, payload, metricId }: { active?: boolean; payload?: { payload: Point }[]; metricId: LensComparison['metricId'] }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="chart-tooltip">
      <strong>{friendlyDay(p.day)}</strong> <span className="muted">{formatDay(p.day)}</span>
      <div>Value: {p.value === null ? 'No reading' : formatValue(metricId, p.value)}</div>
      <div>BASELINE: <strong>{STATUS_PLAIN[p.status]}</strong></div>
      <div>Outside her pre-launch range: {YES_NO(p.preflightFlag)}</div>
      <div>Past the Earth limit: {YES_NO(p.earthFlag)}</div>
    </div>
  );
}

function StatusDot(props: { cx?: number; cy?: number; payload?: Point; selected: number }) {
  const { cx, cy, payload, selected } = props;
  if (cx === undefined || cy === undefined || !payload || payload.value === null) return <g />;
  const isSel = payload.day === selected;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSel ? 6 : payload.status === 'OK' ? 2.5 : 4.5}
      fill={STATUS_COLOR[payload.status]}
      stroke={isSel ? '#111' : 'none'}
      strokeWidth={isSel ? 2 : 0}
    />
  );
}

export function ThreeLensChart({ lens, selectedDay, currentDay }: { lens: LensComparison; selectedDay: number; currentDay: number }) {
  if (lens.perDay.length === 0) return <p className="muted">No data to chart</p>;

  const def = METRICS[lens.metricId];
  const ref = EARTH_REFERENCES.find((r) => r.metricId === lens.metricId) ?? null;
  const hasModel = lens.perDay.some((d) => d.expectedLow !== null);
  const data: Point[] = lens.perDay.map((d) => ({
    day: d.missionDay,
    value: d.value,
    preBand: [d.preflightLow, d.preflightHigh],
    expBand: d.expectedLow !== null && d.expectedHigh !== null ? [d.expectedLow, d.expectedHigh] : null,
    status: d.baselineStatus,
    preflightFlag: d.preflightFlag,
    earthFlag: d.earthFlag,
  }));
  const first = data[0]!.day;
  const ticks = [first, -15, 0, 15, 30, 45, 60, 75, 90, currentDay].filter((t, i, a) => t >= first && t <= currentDay && a.indexOf(t) === i);

  return (
    <figure className="chart">
      <div className="chart__box">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#e7e9e4" vertical={false} />
            <XAxis
              dataKey="day"
              type="number"
              domain={[first, currentDay]}
              ticks={ticks}
              tickFormatter={formatDay}
              fontSize={12}
            />
            <YAxis
              domain={['auto', 'auto']}
              fontSize={12}
              width={48}
              tickFormatter={(v: number) => v.toFixed(Math.min(def.decimals, 1))}
            />
            <Tooltip content={<ChartTooltip metricId={lens.metricId} />} />
            <Area
              dataKey="preBand"
              name="Your normal before launch"
              type="linear"
              stroke="#a3aab3"
              fill="#cfd4da"
              fillOpacity={0.45}
              isAnimationActive={false}
              activeDot={false}
            />
            {hasModel && (
              <Area
                dataKey="expBand"
                name="Expected for her in space (research model)"
                type="linear"
                stroke="#2b50c8"
                fill="#a9bcf2"
                fillOpacity={0.45}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={false}
              />
            )}
            <ReferenceLine x={0} stroke="#3c4043" strokeDasharray="2 3" label={{ value: 'Launch', position: 'insideTopLeft', fontSize: 12 }} />
            {ref && (
              <ReferenceLine
                y={ref.value}
                stroke="#b42318"
                strokeDasharray="6 4"
                strokeWidth={2}
                ifOverflow="extendDomain"
                label={{ value: ref.label, position: 'insideBottomRight', fill: '#b42318', fontSize: 12 }}
              />
            )}
            <ReferenceLine x={selectedDay} stroke="#111" strokeWidth={1.5} label={{ value: formatDay(selectedDay), position: 'top', fontSize: 12 }} />
            <Line
              dataKey="value"
              name="Daily readings"
              type="linear"
              stroke="#3c4043"
              strokeWidth={1.2}
              connectNulls={false}
              isAnimationActive={false}
              dot={(p: object) => <StatusDot key={(p as { index?: number }).index} {...(p as object)} selected={selectedDay} />}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {!hasModel && (
        <figcaption className="chart__note">
          No published research says how this measure changes in space, so there is no blue band: BASELINE compares it with her normal before launch.
        </figcaption>
      )}
      <p className="visually-hidden">
        Chart of {def.label} from {formatDay(first)} to {formatDay(currentDay)}. Of {lens.daysEvaluated} in-flight days with
        data, the Earth reference flagged {lens.flagged.earth === null ? 'no days (no reference for this measure)' : `${lens.flagged.earth} days`},
        the pre-flight normal alone flagged {lens.flagged.preflightOnly} days, and BASELINE flagged {lens.flagged.baseline} days.
      </p>
    </figure>
  );
}
