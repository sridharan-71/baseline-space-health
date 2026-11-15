import { formatDay } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { friendlyDay } from '../plain';

const QUICK: { day: number; hint: string }[] = [
  { day: 60, hint: 'normal space change' },
  { day: 96, hint: 'first unusual day' },
  { day: 97, hint: 'unusual again' },
  { day: 98, hint: 'missing reading' },
  { day: 99, hint: 'today' },
];

export function DayScrubber() {
  const { selectedDay, setSelectedDay, input } = useMission();
  return (
    <div className="scrubber">
      <label htmlFor="day-scrubber">
        Drag to pick a day: <strong>{friendlyDay(selectedDay)}</strong> <span className="muted small">({formatDay(selectedDay)})</span>
      </label>
      <input
        id="day-scrubber"
        type="range"
        min={-30}
        max={input.currentDay}
        step={1}
        value={selectedDay}
        aria-valuetext={friendlyDay(selectedDay)}
        onChange={(e) => {
          const v = Number(e.target.value);
          // Launch day has no readings: step over it in the direction of travel.
          setSelectedDay(v === 0 ? (selectedDay > 0 ? -1 : 1) : v);
        }}
      />
      <div className="scrubber__quick">
        <span className="muted small">Key days:</span>
        {QUICK.filter((q) => q.day <= input.currentDay).map((q) => (
          <button
            key={q.day}
            type="button"
            className={`chip${selectedDay === q.day ? ' chip--on' : ''}`}
            aria-pressed={selectedDay === q.day}
            aria-label={formatDay(q.day)}
            onClick={() => setSelectedDay(q.day)}
          >
            Day {q.day} <span className="chip__hint">· {q.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
