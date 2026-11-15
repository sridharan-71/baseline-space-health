import { useState } from 'react';
import { formatDay, formatValue, type MetricId } from '../../engine/index';
import { useDayAssessment, useLens, useMission, type Tab } from '../../state/MissionContext';

interface Step {
  day: number;
  metricId: MetricId | null;
  tab: Tab;
  title: string;
}

const STEPS: Step[] = [
  { day: 60, metricId: 'coreTemp', tab: 'measure', title: '“Is this space?” — FD60 core temperature' },
  { day: 97, metricId: 'restingHR', tab: 'measure', title: '“…or is this me?” — FD97 resting heart rate' },
  { day: 98, metricId: 'coreTemp', tab: 'today', title: 'Missing data — FD98' },
  { day: 99, metricId: null, tab: 'note', title: 'The CMO note — FD99' },
];

function Caption({ step }: { step: number }) {
  const temp = useLens('coreTemp');
  const hr = useLens('restingHR');
  const d97 = useDayAssessment(97);
  const d98 = useDayAssessment(98);
  const d99 = useDayAssessment(99);
  const hr97 = d97.metrics.find((m) => m.metricId === 'restingHR')!;
  const t98 = d98.metrics.find((m) => m.metricId === 'coreTemp')!;
  const t99 = d99.metrics.find((m) => m.metricId === 'coreTemp')!;
  const conf = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }[t99.confidence];

  if (step === 0)
    return (
      <p>
        On day 60 her temperature is well above her pre-flight normal, so a pre-flight-only system would alarm. ISS research
        found resting core temperature rises about 1 °C over roughly 75 days in flight. BASELINE expects that rise, so it says
        OK — and the Why card shows why. Pre-flight-only would have flagged her on <strong>{temp.flagged.preflightOnly}</strong>{' '}
        of {temp.daysEvaluated} in-flight days; BASELINE flagged <strong>{temp.flagged.baseline}</strong>.
      </p>
    );
  if (step === 1)
    return (
      <p>
        The opposite failure. {hr97.value === null ? 'Her heart rate' : formatValue('restingHR', hr97.value)} is normal on Earth, so
        the Earth lens flagged <strong>{hr.flagged.earth ?? 0}</strong> days. For her, it is outside her own normal on{' '}
        <strong>
          {hr97.persistence.flaggedOfLastAvailable} of the last {hr97.persistence.availableInWindow}
        </strong>{' '}
        days, alongside short sleep. BASELINE status: <strong>{hr97.status}</strong>.
      </p>
    );
  if (step === 2)
    return (
      <p>
        No reading is not “fine”. The temperature card says <strong>{t98.status}</strong> — “{t98.reasons[0]}” — and the next
        day the confidence drops to <strong>{conf}</strong>.
      </p>
    );
  return (
    <p>
      One tap gives a structured SBAR note for the crew medical officer: situation, pre-flight and expected values, the data
      gap, and a request for review. It is a draft the astronaut edits. BASELINE never diagnoses.
    </p>
  );
}

export function DemoTour({ onClose }: { onClose: () => void }) {
  const { jumpTo } = useMission();
  const [i, setI] = useState(0);
  const go = (n: number) => {
    const s = STEPS[n]!;
    setI(n);
    jumpTo(s.day, s.metricId, s.tab);
  };
  const step = STEPS[i]!;
  return (
    <aside className="tour" aria-label="Guided demo" aria-live="polite">
      <div className="tour__head">
        <strong>
          Guided demo · {i + 1}/{STEPS.length}
        </strong>
        <button type="button" className="btn btn--ghost" onClick={onClose} aria-label="Close guided demo">
          ✕
        </button>
      </div>
      <h3>{step.title}</h3>
      <p className="muted">Showing {formatDay(step.day)}</p>
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
    </aside>
  );
}

export const TOUR_FIRST_STEP = STEPS[0]!;
