import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { assessWhatIf } from '../whatIf';
import { STATUS_PLAIN, friendlyDay } from '../plain';
import { formatValue, type MetricId } from '../../engine/index';
import { useDayAssessment, useLens, useMission, type Tab } from '../../state/MissionContext';

interface Step {
  day: number;
  metricId: MetricId | null;
  tab: Tab;
  title: string;
  scrollTo?: string;
}

const STEPS: Step[] = [
  { day: 99, metricId: null, tab: 'today', title: 'Meet Cmdr. Asha Rao — day 99 in space' },
  { day: 60, metricId: 'coreTemp', tab: 'measure', title: 'Is this space? — temperature on day 60' },
  { day: 99, metricId: 'coreTemp', tab: 'measure', title: 'Same number, different meaning', scrollTo: 'same-title' },
  { day: 97, metricId: 'restingHR', tab: 'measure', title: '…or is this me? — heart rate on day 97' },
  { day: 99, metricId: null, tab: 'note', title: 'Hand it to the medical officer' },
];

function Caption({ step }: { step: number }) {
  const { input } = useMission();
  const temp = useLens('coreTemp');
  const hr = useLens('restingHR');
  const d97 = useDayAssessment(97);
  const d99 = useDayAssessment(99);
  const hr97 = d97.metrics.find((m) => m.metricId === 'restingHR')!;
  const flagged99 = d99.metrics.filter((m) => m.status === 'ACT' || m.status === 'WATCH').length;
  const same = useMemo(() => [4, 90].map((d) => assessWhatIf(input, 'coreTemp', d, 37.6)), [input]);
  const C = (fact: ReactNode, line: ReactNode, look: string) => (
    <>
      <p className="tour__fact">{fact}</p>
      <p className="tour__line">{line}</p>
      <p className="tour__look">
        <span aria-hidden="true">◎</span> Look at: {look}
      </p>
    </>
  );

  if (step === 0)
    return C(
      <>{STATUS_PLAIN[d99.overall]} · {flagged99} of {d99.metrics.length} measures unusual</>,
      'A fictional astronaut, 99 days into a long mission. One card answers “how is she doing?”.',
      'the overall status card',
    );
  if (step === 1)
    return C(
      <>
        {temp.flagged.preflightOnly} vs {temp.flagged.baseline} days flagged
      </>,
      <>
        ISS research expects core temperature to rise ~1 °C in flight. Her pre-launch normal alone flags{' '}
        {temp.flagged.preflightOnly} of {temp.daysEvaluated} days; BASELINE allows for the rise and says “Normal for you” on day 60.
      </>,
      'the blue “expected in space” band',
    );
  if (step === 2)
    return C(
      <>37.6 °C → {same.map((a) => STATUS_PLAIN[a.status]).join(' / ')}</>,
      'Same temperature on day 4 and day 90. Different mission context, different answer — computed live.',
      'the two side-by-side cards',
    );
  if (step === 3)
    return C(
      <>
        {hr97.value === null ? 'No reading' : formatValue('restingHR', hr97.value)} · unusual {hr97.persistence.flaggedOfLastAvailable} of{' '}
        {hr97.persistence.availableInWindow} days
      </>,
      <>
        Normal by Earth limits ({hr.flagged.earth ?? 0} days flagged), unusual for her. No space model for heart rate — her own
        history only.
      </>,
      'the heart-rate result card',
    );
  return C(
    'A ready SBAR handoff',
    'Situation, Background, Assessment, Request — including the day 98 data gap. She edits it before sharing. BASELINE never diagnoses.',
    'the note preview',
  );
}

const TARGET = ['.overall', '.chart', 'section.same', '[data-testid=card-restingHR]', '.sbar'];

function highlight(sel: string | null) {
  document.querySelectorAll('.tour-target').forEach((el) => el.classList.remove('tour-target'));
  if (!sel) return;
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('tour-target');
  el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
}

export function DemoTour({ onClose }: { onClose: () => void }) {
  const { jumpTo, setActiveTab } = useMission();
  const [i, setI] = useState(0);
  const go = (n: number) => {
    const s = STEPS[n]!;
    setI(n);
    jumpTo(s.day, s.metricId, s.tab);
  };
  // Highlight the part of the screen this step talks about; clear it when the tour closes.
  useEffect(() => {
    const t = setTimeout(() => highlight(TARGET[i] ?? null), 120);
    return () => clearTimeout(t);
  }, [i]);
  useEffect(() => () => highlight(null), []);
  const step = STEPS[i]!;
  return (
    <aside className="tour" aria-label="Guided demo" aria-live="polite">
      <div className="tour__head">
        <span className="tour__count">
          Guided demo · {i + 1}/{STEPS.length}
        </span>
        <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Close guided demo">
          ✕
        </button>
      </div>
      <div className="tour__progress" aria-hidden="true">
        {STEPS.map((_, n) => (
          <span key={n} className={n <= i ? 'on' : ''} />
        ))}
      </div>
      <h3>{step.title}</h3>
      <p className="tour__where">Showing {friendlyDay(step.day).toLowerCase()}</p>
      <Caption step={i} />
      <div className="tour__nav">
        <button type="button" className="btn btn--ghost" disabled={i === 0} onClick={() => go(i - 1)}>
          Back
        </button>
        {i < STEPS.length - 1 ? (
          <button type="button" className="btn btn--primary" onClick={() => go(i + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Finish
          </button>
        )}
      </div>
      {i === STEPS.length - 1 && (
        <button
          type="button"
          className="btn btn--text"
          onClick={() => {
            setActiveTab('evidence');
            onClose();
            setTimeout(() => document.getElementById('stress-test')?.scrollIntoView?.({ behavior: 'smooth' }), 60);
          }}
        >
          Is this fair? See the stress test →
        </button>
      )}
    </aside>
  );
}

export const TOUR_FIRST_STEP = STEPS[0]!;
