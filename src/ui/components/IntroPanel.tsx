import { useState } from 'react';
import { StatusLegend } from './StatusBadge';

const KEY = 'baseline.v1.introHidden';

function readHidden(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** One-sentence first-visit explanation plus the colour key. Dismissible. */
export function IntroPanel({ onStartDemo }: { onStartDemo?: () => void }) {
  const [hidden, setHidden] = useState(readHidden);
  const set = (h: boolean) => {
    setHidden(h);
    try {
      localStorage.setItem(KEY, h ? '1' : '0');
    } catch {
      /* storage unavailable: just hide for this visit */
    }
  };
  if (hidden) {
    return (
      <button type="button" className="btn btn--text intro-reopen" onClick={() => set(false)}>
        ⓘ What am I looking at?
      </button>
    );
  }
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro__text">
        <h2 id="intro-title">What am I looking at?</h2>
        <p>
          In space, “normal” moves — core temperature slowly rises about 1 °C. BASELINE judges each reading against{' '}
          <strong>what is normal for this astronaut, on this mission day</strong>.
        </p>
      </div>
      <StatusLegend />
      <div className="intro__actions">
        {onStartDemo && (
          <button type="button" className="btn btn--primary" onClick={onStartDemo}>
            ▶ 2-minute guided demo
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => set(true)}>
          Got it — hide
        </button>
      </div>
    </section>
  );
}
