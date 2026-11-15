import type { MetricId } from '../../engine/index';

/** Simple original line icons. Decorative only: every icon sits next to a text label. */
const PATHS: Record<MetricId | 'astronaut' | 'doc' | 'chart' | 'flask' | 'alert', string> = {
  coreTemp: 'M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z M12 9v6',
  restingHR: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z M5 12h3l1.5-2.5 2 5 1.5-2.5H19',
  sleepHours: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  mood: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8 M9 9.5h.01 M15 9.5h.01',
  astronaut: 'M12 3a6 6 0 0 1 6 6v2a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6Z M8.5 9.5h7v2.5a3.5 3.5 0 0 1-7 0Z M5 21c.6-3 3.3-5 7-5s6.4 2 7 5',
  doc: 'M7 3h7l4 4v14H7Z M14 3v4h4 M10 12h5 M10 15.5h5',
  chart: 'M4 19h16 M5 15l4-5 4 3 6-7',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3 M7.5 15h9',
  alert: 'M12 4 2.5 20h19Z M12 10v4.5 M12 17.5h.01',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Coloured round chip that identifies a measure (colour = measure identity, never status). */
export function MetricIcon({ id, size = 40 }: { id: MetricId; size?: number }) {
  return (
    <span className={`metric-icon metric-icon--${id}`} style={{ width: size, height: size }}>
      <Icon name={id} size={Math.round(size * 0.52)} />
    </span>
  );
}
