import { friendlyDay } from '../plain';
import { useState, type FormEvent } from 'react';
import { METRICS, SYMPTOM_LABELS, type MetricId, type SymptomId } from '../../engine/index';
import { useMission } from '../../state/MissionContext';

const NUMBER_FIELDS: { id: Exclude<MetricId, 'mood'>; step: string }[] = [
  { id: 'coreTemp', step: '0.01' },
  { id: 'restingHR', step: '1' },
  { id: 'sleepHours', step: '0.1' },
];

export function CheckInForm({ day }: { day: number }) {
  const { addReading, addSelfReport } = useMission();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [mood, setMood] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const label = friendlyDay(day);

  function toggleSymptom(s: SymptomId) {
    setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string[]> = {};
    let count = 0;
    for (const f of NUMBER_FIELDS) {
      const raw = (values[f.id] ?? '').trim();
      if (raw === '') continue;
      const res = addReading({ metricId: f.id, missionDay: day, value: Number(raw) });
      if (res.ok) count++;
      else errs[f.id] = res.errors;
    }
    if (mood !== null) {
      const res = addReading({ metricId: 'mood', missionDay: day, value: mood });
      if (res.ok) count++;
      else errs.mood = res.errors;
    }
    if (symptoms.length > 0 || note.trim() !== '') {
      const res = addSelfReport({ missionDay: day, symptoms, note: note.trim() || undefined });
      if (res.ok) count++;
      else errs.selfReport = res.errors;
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSaved(count > 0 ? `Saved ${count} entr${count === 1 ? 'y' : 'ies'} for ${label}.` : 'Nothing to save — fill in at least one field.');
      if (count > 0) {
        setValues({});
        setMood(null);
        setSymptoms([]);
        setNote('');
      }
    } else {
      setSaved(null);
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
        Enter readings for {label}
      </button>
    );
  }

  return (
    <form className="checkin" onSubmit={onSubmit} aria-label={`Enter readings for ${label}`} noValidate>
      <div className="checkin__head">
        <h3>Enter readings for {label}</h3>
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      <p className="fine-print">Saved on this device only. Your entries replace the simulated value for that day.</p>
      <div className="checkin__grid">
        {NUMBER_FIELDS.map((f) => {
          const m = METRICS[f.id];
          const err = errors[f.id];
          return (
            <div key={f.id} className="field">
              <label htmlFor={`ci-${f.id}`}>
                {m.label} ({m.unit})
              </label>
              <input
                id={`ci-${f.id}`}
                type="number"
                inputMode="decimal"
                step={f.step}
                value={values[f.id] ?? ''}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `ci-${f.id}-err` : undefined}
                onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
              />
              {err && (
                <p className="field__error" id={`ci-${f.id}-err`} role="alert">
                  {err.join(' ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <fieldset className="field">
        <legend>{METRICS.mood.label}</legend>
        <div className="mood-buttons">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`chip${mood === n ? ' chip--on' : ''}`}
              aria-pressed={mood === n}
              onClick={() => setMood(mood === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
        {errors.mood && <p className="field__error">{errors.mood.join(' ')}</p>}
      </fieldset>
      <fieldset className="field">
        <legend>How do you feel? (optional)</legend>
        <div className="chips">
          {(Object.keys(SYMPTOM_LABELS) as SymptomId[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`chip${symptoms.includes(s) ? ' chip--on' : ''}`}
              aria-pressed={symptoms.includes(s)}
              onClick={() => toggleSymptom(s)}
            >
              {SYMPTOM_LABELS[s]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="ci-note">Note (optional)</label>
        <textarea id="ci-note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        {errors.selfReport && <p className="field__error">{errors.selfReport.join(' ')}</p>}
      </div>
      <button type="submit" className="btn btn--primary">
        Save check-in
      </button>
      {saved && (
        <p className="success" role="status">
          {saved}
        </p>
      )}
    </form>
  );
}
