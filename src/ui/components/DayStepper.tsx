import { formatDay } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { friendlyDay } from '../plain';

/** Previous / next day control shared by every screen that shows one day. */
export function DayStepper({ compact = false }: { compact?: boolean }) {
  const { selectedDay, stepDay, setSelectedDay, input } = useMission();
  const isToday = selectedDay === input.currentDay;
  return (
    <div className={`stepper${compact ? ' stepper--compact' : ''}`}>
      <button type="button" className="btn btn--icon" onClick={() => stepDay(-1)} disabled={selectedDay <= -30} aria-label="Previous day">
        ←
      </button>
      <div className="stepper__label">
        <span className="stepper__day">{friendlyDay(selectedDay)}</span>
        <span className="stepper__code">{formatDay(selectedDay)}{isToday ? ' · latest' : ''}</span>
      </div>
      <button type="button" className="btn btn--icon" onClick={() => stepDay(1)} disabled={isToday} aria-label="Next day">
        →
      </button>
      {!isToday && (
        <button type="button" className="btn btn--text" onClick={() => setSelectedDay(input.currentDay)}>
          Back to latest day
        </button>
      )}
    </div>
  );
}
