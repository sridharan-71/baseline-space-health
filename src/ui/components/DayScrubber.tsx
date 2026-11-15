import { formatDay } from '../../engine/index';
import { useMission } from '../../state/MissionContext';

const QUICK = [60, 96, 97, 98, 99];

export function DayScrubber() {
  const { selectedDay, setSelectedDay, input } = useMission();
  return (
    <div className="scrubber">
      <label htmlFor="day-scrubber">
        Mission day: <strong>{formatDay(selectedDay)}</strong>
      </label>
      <input
        id="day-scrubber"
        type="range"
        min={-30}
        max={input.currentDay}
        step={1}
        value={selectedDay}
        aria-valuetext={formatDay(selectedDay)}
        onChange={(e) => {
          const v = Number(e.target.value);
          // Launch day has no readings: step over it in the direction of travel.
          setSelectedDay(v === 0 ? (selectedDay > 0 ? -1 : 1) : v);
        }}
      />
      <div className="scrubber__quick">
        {QUICK.filter((d) => d <= input.currentDay).map((d) => (
          <button
            key={d}
            type="button"
            className={`chip${selectedDay === d ? ' chip--on' : ''}`}
            aria-pressed={selectedDay === d}
            onClick={() => setSelectedDay(d)}
          >
            {formatDay(d)}
          </button>
        ))}
      </div>
    </div>
  );
}
