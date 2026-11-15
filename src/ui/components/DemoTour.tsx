import { useState } from 'react';
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
  const temp = useLens('coreTemp');
  const hr = useLens('restingHR');
  const d97 = useDayAssessment(97);
  const d99 = useDayAssessment(99);
  const hr97 = d97.metrics.find((m) => m.metricId === 'restingHR')!;
  const flagged99 = d99.metrics.filter((m) => m.status === 'ACT' || m.status === 'WATCH').length;

  if (step === 0)
    return (
      <p>
        A fictional astronaut, 99 days into a long mission. The top of Today answers “how is she doing?” in one line:{' '}
        <strong>{STATUS_PLAIN[d99.overall]}</strong>, with {flagged99} of {d99.metrics.length} measures unusual. Below it,
        “What needs attention?” says what changed, compared with what, for how long, and how sure BASELINE is.
      </p>
    );
  if (step === 1)
    return (
      <p>
        On day 60 her temperature is well above her pre-launch normal. ISS research found resting core temperature rises
        about 1 °C over ~75 days, and BASELINE expects that rise — so it says “Normal for you”. Her pre-launch normal alone
        would have flagged <strong>{temp.flagged.preflightOnly}</strong> of {temp.daysEvaluated} days in space; BASELINE
        flagged <strong>{temp.flagged.baseline}</strong>.
      </p>
    );
  if (step === 2)
    return (
      <p>
        The same 37.6 °C reading, judged by the live engine on day 4 and day 90, gets two different answers — because what
        is normal for her moves during the mission. Only temperature has a research-based space model in BASELINE.
      </p>
    );
  if (step === 3)
    return (
      <p>
        The opposite failure. {hr97.value === null ? 'Her heart rate' : formatValue('restingHR', hr97.value)} is normal by
        Earth limits (Earth flagged <strong>{hr.flagged.earth ?? 0}</strong> days). For her, it is outside her own range on{' '}
        <strong>
          {hr97.persistence.flaggedOfLastAvailable} of the last {hr97.persistence.availableInWindow}
        </strong>{' '}
        days. There is no space model for heart rate, so this uses her own history only.
      </p>
    );
  return (
    <p>
      One tap gives a structured SBAR note: situation, her normal and expected values, data gaps (her temperature reading
      is missing on day 98), and a request for review — with the supporting readings shown. She edits it before sharing.
      BASELINE never diagnoses.
    </p>
  );
}

export function DemoTour({ onClose }: { onClose: () => void }) {
  const { jumpTo, setActiveTab } = useMission();
  const [i, setI] = useState(0);
  const go = (n: number) => {
    const s = STEPS[n]!;
    setI(n);
    jumpTo(s.day, s.metricId, s.tab);
    setTimeout(() => {
      if (s.scrollTo) document.getElementById(s.scrollTo)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      else window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }, 60);
  };
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
